import type { Leistungskontext, Leistungsposten } from "./pflege.type";
import type { Zeitraum } from "./zeitraum.type";
import { PflegegeldMap, PflegesachleistungsMap } from "./hoechstsaetze.map";
import type { Kalender } from "./kalender.type";
import { Leistungsart, type Pflegegrad } from "./pflege.enums";


export function ermittlePflegegeld(abrechnungszeitraumListe: Array<Zeitraum>,
		pflegegrad: Pflegegrad, leistungskontext: Leistungskontext): Array<Leistungsposten> {
    
    const pflegegeldAnspruch = PflegegeldMap.get(pflegegrad);
	let pflegesachleistungsAnspruch = PflegesachleistungsMap.get(pflegegrad);

		if (pflegegeldAnspruch === undefined) {
			return [];
		}

		if (pflegesachleistungsAnspruch === undefined) {
			pflegesachleistungsAnspruch = 0;
		}

		return abrechnungszeitraumListe.map((abrechnungszeitraum) => ({
			beginn: abrechnungszeitraum.beginn,
			ende: abrechnungszeitraum.ende,
			leistungsart: Leistungsart.PFLEGEGELD,
			tage: abrechnungszeitraum.tage,
			betrag: berechnePflegegeld(abrechnungszeitraum, pflegegeldAnspruch, leistungskontext)
		}));
	}

function berechnePflegegeld(abrechnungszeitraum: Zeitraum, pflegegeldAnspruch: number, leistungskontext: Leistungskontext) {

	let pflegesachleistungsAnspruch = PflegesachleistungsMap.get(leistungskontext.pflegegrad)

	if (pflegesachleistungsAnspruch === undefined) {
		pflegesachleistungsAnspruch = 0;
	}

	let pflegesachleistungsBetrag = 0;
	if(leistungskontext.leistungsart === Leistungsart.PFLEGESACHLEISTUNG) {
		pflegesachleistungsBetrag = leistungskontext.rechnungsbetrag;
	}

    let pflegegeldTageweise = berechnePflegegeldTageweise(abrechnungszeitraum, pflegegeldAnspruch);
    
	let pflegegeldAnteilig = berechnePflegegeldAnteilig(abrechnungszeitraum, pflegegeldAnspruch, pflegesachleistungsAnspruch, pflegesachleistungsBetrag);

    if (pflegegeldTageweise > pflegegeldAnteilig) {
		return pflegegeldAnteilig;
	} else {
		return pflegegeldTageweise;
	}
}

function berechnePflegegeldTageweise(zeitraum: Zeitraum, pflegegeldAnspruch: number): number {
		if (pflegegeldAnspruch === undefined) {
			return 0;
		}
		if (zeitraum.beginn.getMonth() === 1) {
			const year = zeitraum.beginn.getFullYear();
			const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
			const maxDaysInFebruary = isLeapYear ? 29 : 28;
			if (zeitraum.tage === maxDaysInFebruary) {
				return pflegegeldAnspruch;
			} else {
				return (pflegegeldAnspruch / 30) * zeitraum.tage;
			}
		}

		return Math.min(pflegegeldAnspruch, (pflegegeldAnspruch / 30) * zeitraum.tage);
	}

function berechnePflegegeldAnteilig(zeitraum: Zeitraum, pflegegeldAnspruch: number, pflegesachleistungsAnspruch: number, pflegesachleistungsBetrag: number): number {	
	if (pflegegeldAnspruch === undefined) {
		return 0;
	}

	let anteilPflegesachleistungAusgeschoepft = pflegesachleistungsBetrag / pflegesachleistungsAnspruch;

	if (anteilPflegesachleistungAusgeschoepft >= 1) {
		return 0;
	} else {
		return pflegegeldAnspruch * (1 - anteilPflegesachleistungAusgeschoepft);
	}

}