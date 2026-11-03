import { across, receding } from './projection.js';

// All textures are local vector patterns. No embedded picture or raster filter.
export const materialDefinitions = `
  <pattern id="escher-stone-light" width="9" height="9" patternUnits="userSpaceOnUse">
    <rect width="9" height="9" fill="#d8d3c4"/>
    <path d="M-2,9L9,-2M7,11L11,7" stroke="#8e8878" stroke-width=".65" opacity=".25"/>
  </pattern>
  <pattern id="escher-stone-mid" width="7" height="7" patternUnits="userSpaceOnUse">
    <rect width="7" height="7" fill="#aaa697"/>
    <path d="M-2,7L7,-2M5,9L9,5" stroke="#655f51" stroke-width=".7" opacity=".3"/>
  </pattern>
  <pattern id="escher-stone-dark" width="6" height="6" patternUnits="userSpaceOnUse">
    <rect width="6" height="6" fill="#817e71"/>
    <path d="M-2,6L6,-2M4,8L8,4" stroke="#49483f" stroke-width=".75" opacity=".35"/>
  </pattern>
  <pattern id="escher-brick-front" width="38" height="20" patternUnits="userSpaceOnUse" patternTransform="matrix(1 ${across[1]} 0 1 0 0)">
    <rect width="38" height="20" fill="url(#escher-stone-light)"/>
    <path d="M0,0H38M0,10H38M0,0V10M19,10V20" fill="none" stroke="#8d8778" stroke-width=".75" opacity=".48"/>
  </pattern>
  <pattern id="escher-brick-side" width="38" height="20" patternUnits="userSpaceOnUse" patternTransform="matrix(1 ${receding[1]} 0 1 0 0)">
    <rect width="38" height="20" fill="url(#escher-stone-mid)"/>
    <path d="M0,0H38M0,10H38M0,0V10M19,10V20" fill="none" stroke="#625e52" stroke-width=".8" opacity=".5"/>
  </pattern>
  <pattern id="escher-roof-tiles" width="18" height="14" patternUnits="userSpaceOnUse" patternTransform="matrix(1 ${receding[1]} .65 .7 0 0)">
    <rect width="18" height="14" fill="#737368"/>
    <path d="M0,0V6Q4.5,11 9,6V0M9,0V6Q13.5,11 18,6V0M-4.5,7V13Q0,18 4.5,13V7M4.5,7V13Q9,18 13.5,13V7" fill="none" stroke="#42483e" stroke-width=".9"/>
  </pattern>
  <pattern id="escher-paving" width="45" height="30" patternUnits="userSpaceOnUse" patternTransform="matrix(1 ${across[1]} -.8 ${-.8 * receding[1]} 0 0)">
    <rect width="45" height="30" fill="#d3cdbb"/>
    <path d="M0,0H45V30H0Z" fill="none" stroke="#a29b89" stroke-width=".8"/>
  </pattern>`;
