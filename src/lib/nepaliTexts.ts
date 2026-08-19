// ===== Nepali Text Banks =====
// Standard Devanagari Unicode and corresponding Preeti font QWERTY mapped keys.

export interface NepaliTextPair {
  unicode: string;
  preeti: string;
}

export const nepaliTexts: NepaliTextPair[] = [
  {
    unicode: "नेपाल एक सुन्दर देश हो ।",
    preeti: "g]kfn Ps ;'Gb/ b]z xf] ."
  },
  {
    unicode: "सगरमाथा संसारको सबैभन्दा अग्लो हिमाल हो ।",
    preeti: ";u/dfyf ;+;f/sf] ;a}eGbf cUnf] lxdfn xf] ."
  },
  {
    unicode: "काठमाडौँ नेपालको राजधानी हो ।",
    preeti: "sf7df8f}F g]kfnsf] /fhwfgL xf] ."
  },
  {
    unicode: "हामी नेपाली हुनुमा गर्व गर्छौँ ।",
    preeti: "xfdL g]kfnL x'g'df uJ{ u5f}{F ."
  },
  {
    unicode: "समय नै धन हो यसको सही सदुपयोग गरौँ ।",
    preeti: ";do g} wg xf] o;sf] ;xL ;b'kofu u/f}+ ."
  },
  {
    unicode: "कृषि र पर्यटन नेपालको विकासको मुख्य आधार हो ।",
    preeti: "s[lif / ko{6g g]kfnsf] ljsf;sf] d'Vo cfwf/ xf] ."
  },
  {
    unicode: "सबै नेपाली मिलेर देशको उन्नती गर्नुपर्छ ।",
    preeti: ";a} g]kfnL ldny/ b]zsf] pGgtL ug'{k5{ ."
  },
  {
    unicode: "हाम्रो सुन्दर देश नेपाल शान्त र शान्तिप्रिय छ ।",
    preeti: "xfd|f] ;'Gb/ b]z g]kfn zfGt / zfGtlk|o 5 ."
  }
];

export function getRandomNepaliText(layout: 'unicode' | 'preeti'): string {
  const index = Math.floor(Math.random() * nepaliTexts.length);
  const pair = nepaliTexts[index];
  return layout === 'preeti' ? pair.preeti : pair.unicode;
}
