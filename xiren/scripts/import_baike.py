"""Refresh source facts: pip install beautifulsoup4; python xiren/scripts/import_baike.py.

Writes data.generated.json, never the hand-editable data.json. Use --cached to
reuse the HTML cache under the OS temp directory. Group credits are explicitly
distinguished from individual cast credits; incomplete source rows are audited.
"""
import argparse
import concurrent.futures
import datetime
import json
from pathlib import Path
import re
import tempfile
import urllib.parse
import urllib.request

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
CACHE = Path(tempfile.gettempdir()) / 'xiren-baike-cache'
SEASONS = [
    dict(id='yixi', name='一年一度喜剧大赛', tag='一喜', year=2021, lemma='一年一度喜剧大赛第一季/62060507', tables=list(range(1, 8))),
    dict(id='erxi', name='一年一度喜剧大赛2', tag='二喜', year=2022, lemma='一年一度喜剧大赛第二季/61992973', tables=list(range(1, 6))),
    dict(id='xi1', name='喜人奇妙夜', tag='喜一', year=2024, lemma='喜人奇妙夜第一季/66320554', tables=list(range(1, 7))),
    dict(id='xi2', name='喜人奇妙夜2', tag='喜二', year=2025, lemma='喜人奇妙夜第二季/65010962', tables=list(range(1, 7))),
]
ALIASES = {'铁男': '周铁男', '冠朝': '单冠朝', '鑫仔': '詹鑫', '刘大锁': '大锁', '娜娜': '张娜娜'}
TEAM_ALIASES = {'就这个呀': '就这个啊', '莎醛莎美': '莎全莎美', '人溪铁': '人溪铁，饭溪钢', '飞扯不可': '非扯不可', 'OKBOOM!': 'OK!BOOM', 'OK BOOM!': 'OK!BOOM'}


def fetch(url):
    request = urllib.request.Request(urllib.parse.quote(url, safe=':/?=&%,-_'), headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(request, timeout=25) as response:
        return response.read()


def clean(node):
    return node.get_text('', strip=True) if node else ''


def names(text):
    text = re.sub(r'（[^（）]*）', '', text)
    return [ALIASES.get(n.strip(), n.strip()) for n in re.split('[、&，,]', text) if n.strip() and n.strip() not in ('-', '无')]


def rows(table):
    """Expand rowspan/colspan before interpreting column positions."""
    grid = {}
    result = []
    for y, tr in enumerate(table.find_all('tr')):
        x = 0
        for cell in tr.find_all(['td', 'th'], recursive=False):
            while (y, x) in grid:
                x += 1
            w, h = int(cell.get('colspan', 1)), int(cell.get('rowspan', 1))
            for dy in range(h):
                for dx in range(w):
                    grid[y + dy, x + dx] = cell
            x += w
        result.append([grid.get((y, col)) for col in range(max([c for r, c in grid if r == y], default=-1) + 1)])
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--cached', action='store_true')
    parser.add_argument('--portraits', action='store_true', help='Try actor-linked Baidu pages for portrait URLs')
    args = parser.parse_args()
    supplements = json.loads((ROOT / 'supplemental.json').read_text(encoding='utf-8'))
    CACHE.mkdir(exist_ok=True)
    people, all_links, teams, groups, sources, works, audit = {}, {}, {}, {}, [], [], []

    def person(name, sid, role='演员', detail=None):
        name = ALIASES.get(name, name)
        if not name or name in ('无', '-'):
            return None
        if name not in people:
            people[name] = dict(id='p-' + name, name=name, aliases=[a for a, n in ALIASES.items() if n == name], gender='男', baike=None, avatar=None, tags=[], participations=[])
        p = people[name]
        part = next((v for v in p['participations'] if v['seasonId'] == sid), None)
        if part is None:
            part = dict(seasonId=sid, roles=[], roleDetails=[], teams=[], groups=[], works=[])
            p['participations'].append(part)
        if role not in part['roles']:
            part['roles'].append(role)
        if detail and detail not in part['roleDetails']:
            part['roleDetails'].append(detail)
        return part

    def add_team(sid, team, members):
        team = TEAM_ALIASES.get(team, team)
        teams[sid][team] = names(members) if isinstance(members, str) else [ALIASES.get(n, n) for n in members]
        for n in teams[sid][team]:
            part = person(n, sid)
            if team not in part['teams']:
                part['teams'].append(team)

    def add_group(sid, group, members):
        group = TEAM_ALIASES.get(group, group)
        groups[sid][group] = list(dict.fromkeys(members))
        for n in members:
            part = person(n, sid)
            if group not in part['groups']:
                part['groups'].append(group)

    for season in SEASONS:
        sid = season['id']
        path = CACHE / (sid + '.html')
        if not args.cached or not path.exists():
            path.write_bytes(fetch('https://bkso.baidu.com/item/' + season['lemma']))
        soup = BeautifulSoup(path.read_bytes(), 'html.parser')
        for junk in soup.select('sup'):
            junk.decompose()
        tables = soup.find_all('table')
        if len(tables) < 10:
            raise RuntimeError('Source blocked or layout changed: ' + sid)
        url = 'https://baike.baidu.com/item/' + urllib.parse.quote(season['lemma'])
        season['sourceUrl'] = url
        teams[sid], groups[sid] = {}, {}
        for a in soup.select('a[href*="/item/"]'):
            name = ALIASES.get(clean(a), clean(a))
            href = urllib.parse.urljoin('https://baike.baidu.com', a['href']).split('?')[0]
            if name:
                # Prefer the full canonical name over an older ambiguous nickname link.
                if name not in all_links or clean(a) == name:
                    all_links[name] = href
        source_indices = {'yixi': range(1, 11), 'erxi': range(1, 9), 'xi1': range(1, 12), 'xi2': range(1, 17)}[sid]
        sources.append(dict(seasonId=sid, url=url, retrievedFrom='https://bkso.baidu.com/item/' + urllib.parse.quote(season['lemma']), tables=[dict(index=i, rows=[[clean(c) for c in row] for row in rows(tables[i])]) for i in source_indices]))

        # Participant tables, independent from work rows (including eliminated teams).
        if sid == 'yixi':
            for row in rows(tables[9])[1:]:
                text = clean(row[0])
                match = re.match(r'(.+?)队长：(.+?)辅导员：.+?队员：(.+)', text)
                if match:
                    add_group(sid, match[1], names(match[2] + '、' + match[3]))
        if sid == 'erxi':
            for row in rows(tables[1])[1:]:
                text = clean(row[1])
                if not clean(row[2]).startswith('《'):
                    continue
                match = re.match(r'(.+)（([^（）]+)）$', text)
                if match:
                    add_team(sid, match[2], match[1])
        if sid in ('xi1', 'xi2'):
            for row in rows(tables[8 if sid == 'xi1' else 10])[1:]:
                for offset in (0, 2):
                    if clean(row[offset]) != '-':
                        add_team(sid, clean(row[offset]), clean(row[offset + 1]))
            if sid == 'xi2':
                for ti in (8, 9):
                    for cell in tables[ti].find_all('td'):
                        text = clean(cell).split('《')[0]
                        match = re.match(r'(逐梦亚军|某某某|四士同堂|酷酷的天放|胖达人3)(.+)', text)
                        if match:
                            add_team(sid, match[1], match[2])
            group_tables = [9] if sid == 'xi1' else range(11, 16)
            for ti in group_tables:
                for row in rows(tables[ti])[1:]:
                    group = clean(row[0])
                    text = ''.join(clean(c) for c in row[1:])
                    members = []
                    for team, ns in teams[sid].items():
                        if team in text:
                            members.extend(ns)
                    add_group(sid, group, members)

        # Guests: individual introductions, plus named returning comedy friends.
        for item in supplements:
            if item['seasonId'] != sid:
                continue
            if item['team']:
                add_team(sid, item['team'], item['members'])
            for name in item['members']:
                part = person(name, sid)
                part.setdefault('additionalSources', [])
                if item['sourceUrl'] not in part['additionalSources']:
                    part['additionalSources'].append(item['sourceUrl'])

        guest_tables = {'yixi': [8, 10], 'erxi': [6, 7, 8], 'xi1': [7, 11], 'xi2': [7]}[sid]
        for ti in guest_tables:
            for row in rows(tables[ti]):
                for cell in row:
                    text = clean(cell)
                    match = re.match(r'^(.{2,12}?)(?:（|中国|前中国|美籍|英籍)', text)
                    # All introductory cells begin with the guest's name, not a caption.
                    if not match or len(text) < len(match[1]) + 5:
                        continue
                    ns = names(match[1])
                    for n in ns:
                        if n == '五条人':
                            ns = ['仁科', '茂涛']
                            break
                    for n in ns:
                        detail = next((label for label in ['秘书长', '组委会会长', '飞行会长', '特别会员', '固定代表', '会长', '特邀裁判'] if label in text), '观众不代表' if sid == 'xi2' else '节目嘉宾')
                        if sid == 'yixi' and ti == 10 or sid == 'xi1' and ti == 11:
                            detail = '跨界嘉宾'
                        person(n, sid, '嘉宾', ('主持人 / ' + detail) if n == '马东' else detail)
                        if sid == 'erxi' and ti == 7:
                            person(n, sid, '演员', '师哥师姐')
                        # Use a clearly named guest photo if supplied in the same table row.
                        if len(row) == 2 and cell is row[0]:
                            img = row[1].find('img') if row[1] else None
                            if img and len(ns) == 1:
                                people[n]['avatar'] = dict(url=img.get('src'), sourceUrl=url)
        if sid in ('xi1', 'xi2'):
            ti = 10 if sid == 'xi1' else 16
            for row in rows(tables[ti])[1:]:
                text = clean(row[1])
                text = text.replace('（鑫仔）', '')
                # Remove the historical parenthetical credit, retaining only this season's names.
                for token in re.findall(r'([^（）]+)（[^（）]*）', text):
                    for n in names(token):
                        part = person(n, sid, '嘉宾', '喜人好朋友')
                        person(n, sid, '演员')
                        # Xi1 comedy friends only collaborated with a troupe; they were
                        # not troupe members. Xi2 retains its existing source semantics.
                        if sid == 'xi2':
                            group = TEAM_ALIASES.get(clean(row[0]), clean(row[0]))
                            if group not in part['groups']:
                                part['groups'].append(group)
                            if n not in groups[sid].setdefault(group, []):
                                groups[sid][group].append(n)

        # Read only performance columns; never import writers or crew as cast.
        configs = {
            'yixi': {1: (3, [1]), 2: (4, [3]), 3: (4, [3]), 4: (4, [3]), 5: (4, [3]), 6: (3, [2]), 7: (3, [2])},
            'erxi': {1: (2, [1]), 2: (3, [2]), 3: (3, [1, 2]), 4: (4, [1, 2, 3]), 5: (2, [1])},
            'xi1': {1: (2, [1]), 2: (2, [1]), 3: (2, [1]), 4: (2, [1]), 5: (2, [1]), 6: (3, [2])},
            'xi2': {1: (2, [1]), 2: (4, [2]), 3: (4, [2, 3]), 4: (3, [2]), 5: (2, [1]), 6: (2, [1])},
        }
        for ti, (wi, cast_cols) in configs[sid].items():
            for ri, row in enumerate(rows(tables[ti])[1:], 1):
                title = clean(row[wi]) if wi < len(row) else ''
                if not re.fullmatch(r'《.+》', title):
                    continue
                credit = ' / '.join(clean(row[ci]) for ci in cast_cols)
                work = dict(id=f'{sid}-{ti}-{ri}', seasonId=sid, title=title[1:-1], episode=clean(row[0]), sourceCredit=credit, sourceTable=ti, sourceRow=ri, sourceUrl=url)
                works.append(work)
                resolved = {}

                def resolve(token, basis='个人署名'):
                    token = token.strip()
                    token = TEAM_ALIASES.get(token, token)
                    if token in ('', '-', '无'):
                        return
                    if token in teams[sid]:
                        for n in teams[sid][token]:
                            resolved.setdefault(n, '小队署名')
                        return
                    if token in groups[sid]:
                        for n in groups[sid][token]:
                            resolved.setdefault(n, '大团署名')
                        return
                    if '全体boys' in token:
                        # Do not infer actual gender from the user-editable gender field.
                        ns = groups[sid].get(token.replace('全体boys', ''), [])
                        for n in ns:
                            if n not in ('史策', '蒋诗萌', '郭大宝'):
                                resolved.setdefault(n, '大团署名')
                        return
                    if '全员' in token:
                        resolve(token.split('全员')[0])
                        return
                    if '（' in token:
                        prefix, inner = token.split('（', 1)
                        inner = inner.rstrip('）')
                        if sid == 'erxi' and ti == 1:
                            for n in names(prefix):
                                resolve(n)
                        elif sid == 'xi1' and ti in (3, 4):
                            # The source lists a troupe plus its guests. By project convention,
                            # assume every registered troupe member performed in the work.
                            resolve(prefix)
                            for n in names(inner):
                                resolved[ALIASES.get(n, n)] = '个人署名'
                        else:
                            resolve(inner.replace('主创', ''))
                        return
                    if any(c in token for c in '、&'):
                        for n in names(token):
                            resolve(n)
                        return
                    n = ALIASES.get(token, token)
                    if re.fullmatch('[\u4e00-\u9fff]{2,5}', n) and n not in ('壮哈兄弟',):
                        resolved[n] = basis
                    else:
                        audit.append(dict(seasonId=sid, work=work['title'], unresolvedCredit=token))

                for ci in cast_cols:
                    resolve(clean(row[ci]))
                for n, basis in resolved.items():
                    existing = people.get(n)
                    part = next((p for p in existing['participations'] if p['seasonId'] == sid), None) if existing else None
                    if part is None:
                        part = person(n, sid)
                    # Work participation does not turn celebrity guests into competition actors.
                    part['works'].append(dict(workId=work['id'], creditType=basis))
        print(sid, sum(any(v['seasonId'] == sid for v in p['participations']) for p in people.values()), 'people')

    for index, item in enumerate(supplements):
        if any(w['seasonId'] == item['seasonId'] and w['title'] == item['title'] for w in works):
            continue
        work = dict(id=f"{item['seasonId']}-supplement-{index}", seasonId=item['seasonId'], title=item['title'], episode=item['episode'], sourceCredit='、'.join(item['members']), sourceUrl=item['sourceUrl'], note=item['note'])
        works.append(work)
        for name in item['members']:
            person(name, item['seasonId'])['works'].append(dict(workId=work['id'], creditType='个人署名'))

    for p in people.values():
        p['baike'] = all_links.get(p['name'])
        # The first-season nickname 铁男 links to a different person in Baidu.
        if p['name'] == '周铁男':
            p['baike'] = 'https://baike.baidu.com/item/%E5%91%A8%E9%93%81%E7%94%B7/6180197'
        for part in p['participations']:
            p['tags'].extend(part['roles'])
            p['tags'].append(next(s['tag'] for s in SEASONS if s['id'] == part['seasonId']))
        p['tags'] = list(dict.fromkeys(p['tags']))

    if args.portraits:
        def portrait(p):
            if not p['baike']:
                return
            try:
                cache = CACHE / (urllib.parse.quote(p['name']) + '-' + p['baike'].rstrip('/').split('/')[-1] + '.html')
                if not cache.exists():
                    cache.write_bytes(fetch(p['baike'].replace('baike.baidu.com', 'bkso.baidu.com')))
                soup = BeautifulSoup(cache.read_bytes(), 'html.parser')
                meta = soup.find('meta', attrs={'property': 'og:image'})
                if meta and meta.get('content', '').startswith('http'):
                    p['avatar'] = dict(url=meta['content'], sourceUrl=p['baike'])
                else:
                    img = soup.select_one('[class*="summaryPic"] img')
                    if img and img.get('src', '').startswith('http'):
                        p['avatar'] = dict(url=img['src'], sourceUrl=p['baike'])
            except Exception as e:
                print('Portrait unavailable:', ascii(p['name']), str(e)[:60])
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
            list(pool.map(portrait, people.values()))

    data = dict(schemaVersion=1, updatedAt=datetime.date.today().isoformat(), notes=[
        '以四季百度百科的节目表和嘉宾表为主，补充一喜、二喜各25组初舞台名单；百科并非完整片尾演职员表，未列出的助演和部分作品仍可能缺失。',
        '作品标注个人署名、小队署名或大团署名；团体署名按该季正式成员关联，不代表百科逐人确认出场。',
        '喜一部分合作赛仅列出大团和嘉宾；导入时默认假设该大团全员参演，人工核实后可删除未参演者的作品关联。',
        '性别按维护者要求统一初始化为男，尚未核实。',
        '一喜小队名称及缺失初舞台补充自维基百科，二喜缺失初舞台补充自当贝市场节目单，补充作品均标明各自来源。',
    ], seasons=[{k: v for k, v in s.items() if k not in ('lemma', 'tables')} for s in SEASONS], people=sorted(people.values(), key=lambda p: p['name']), works=works, unresolvedCredits=audit)
    ROOT.mkdir(exist_ok=True)
    (ROOT / 'data.generated.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (ROOT / 'sources.json').write_text(json.dumps(sources, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('Total:', len(people), 'people;', len(works), 'works;', len(audit), 'unresolved;', sum(bool(p['avatar']) for p in people.values()), 'portraits')


if __name__ == '__main__':
    main()
