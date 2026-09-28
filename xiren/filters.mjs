export const initialFilters = {
  mode: "single",
  seasons: [],
  role: "",
  gender: "",
  tag: "",
  query: "",
};

export function changeMode(filters, mode) {
  return {
    ...filters,
    mode,
    seasons: mode === "single" ? filters.seasons.slice(0, 1) : filters.seasons,
  };
}

export function toggleSeason(filters, id) {
  const selected = filters.seasons.includes(id);
  return {
    ...filters,
    seasons:
      filters.mode === "single"
        ? selected
          ? []
          : [id]
        : selected
          ? filters.seasons.filter((value) => value !== id)
          : [...filters.seasons, id],
  };
}

export function filterPeople(people, filters) {
  const query = filters.query.trim().toLocaleLowerCase();
  return people.filter((person) => {
    // Role applies within each selected season. A past actor visiting a later
    // season as a guest must not be counted as a competing actor in that season.
    const hasSeason = (id) =>
      person.participations.some(
        (p) =>
          p.seasonId === id &&
          (!filters.role || p.roles.includes(filters.role)),
      );
    const seasonsMatch =
      !filters.seasons.length ||
      (filters.mode === "all"
        ? filters.seasons.every(hasSeason)
        : filters.seasons.some(hasSeason));
    const roleMatch =
      !filters.role ||
      person.participations.some((p) => p.roles.includes(filters.role));
    const searchText = [
      person.name,
      ...(person.aliases || []),
      ...person.participations.flatMap((p) => [...p.teams, ...p.groups]),
    ]
      .join(" ")
      .toLocaleLowerCase();
    return (
      seasonsMatch &&
      roleMatch &&
      (!filters.gender || person.gender === filters.gender) &&
      (!filters.tag || person.tags.includes(filters.tag)) &&
      (!query || searchText.includes(query))
    );
  });
}

export function getTags(people) {
  return [...new Set(people.flatMap((p) => p.tags))];
}
