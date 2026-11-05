// Single central TAG → SharePoint cronograma folder mapping, shared by every
// "Ver cronograma" entry point (map tour popup, tank card, dashboard header).
// Each folder holds the tank's official .mpp/project files for the current
// campaign — provided directly by the user, not guessed or derived.
//
// Only TAGs with a confirmed link are listed here. A tag with nothing here
// simply doesn't show the cronograma button/link yet.

export const TANK_CRONOGRAMA_LINKS: Record<string, string> = {
  "TQ-1222-25":
    "https://3rpetroleumbr.sharepoint.com/:f:/s/POTIGUAR_ATI/IgA-YhGtzxccSJ0U_XBmUxHbAQfNkR32UXwd6jQ5NLyB10k?email=diogo.bezerra%40rcstecnologia.com.br&e=9GWv3w",
  "TQ-1222-33":
    "https://3rpetroleumbr.sharepoint.com/:f:/s/POTIGUAR_ATI/IgDjjDvqPmbFR6xJPST-g-UFARlL8rcpGDdXrrRfcdLDBdE?email=diogo.bezerra%40rcstecnologia.com.br&e=zgDUUh",
  "TQ-1222-35":
    "https://3rpetroleumbr.sharepoint.com/:f:/s/POTIGUAR_ATI/IgCHfaTSX8-LS6vg6hSFJLGbAbzdiA9qJD6JE6NcLDMO3ws?email=diogo.bezerra%40rcstecnologia.com.br&e=HmFYvC",
  "TQ-1222-36":
    "https://3rpetroleumbr.sharepoint.com/:f:/s/POTIGUAR_ATI/IgADsTDU8RyLTY8id0UOiSZnATShSs89uAdBRurwEh3kfJU?email=diogo.bezerra%40rcstecnologia.com.br&e=s0ILd1",
  "TQ-6313004":
    "https://3rpetroleumbr.sharepoint.com/:f:/s/POTIGUAR_ATI/IgAM_m3apvAATpkSop7EmMYaAdvgdHeVMXNvLxZ4swTgjHo?email=diogo.bezerra%40rcstecnologia.com.br&e=upIXLc",
};

export function getTankCronogramaLink(tag: string): string | null {
  return TANK_CRONOGRAMA_LINKS[tag.toUpperCase()] ?? null;
}
