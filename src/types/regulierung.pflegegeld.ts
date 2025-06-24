import type { Leistungsposten } from "./pflege.type";
import type { Zeitraum } from "./zeitraum.type";
import { PflegegeldMap } from "./hoechstsaetze.map";
import type { Kalender } from "./kalender.type";


export function ermittlePflegegeld(abrechnungszeitraumListe: Array<Zeitraum>,
		pflegegrad: string, kalender: Kalender): Array<Leistungsposten> {
    
    const pflegegeldAnspruch = PflegegeldMap.get(pflegegrad);

		if (pflegegeldAnspruch === undefined) {
			return [];
		}

		return abrechnungszeitraumListe.map((abrechnungszeitraum) => ({
			beginn: abrechnungszeitraum.beginn,
			ende: abrechnungszeitraum.ende,
			leistungsart: 'PFLEGEGELD',
			tage: abrechnungszeitraum.tage,
			betrag: berechnePflegegeldTageweise(abrechnungszeitraum, pflegegeldAnspruch)
		}));
	}

function berechnePflegegeld() {
    
    // Pflegegeld tageweise
    // Pflegegeld anteilig

    // Vergleiche tageweise mit anteilig, zahle kleineren Betrag
}

export function ermittlePflegegeldTageweise(
		abrechnungszeitraumListe: Array<Zeitraum>,
		pflegegrad: string
	): Array<Leistungsposten> {
		const pflegegeldAnspruch = PflegegeldMap.get(pflegegrad);

		if (pflegegeldAnspruch === undefined) {
			return [];
		}

		return abrechnungszeitraumListe.map((abrechnungszeitraum) => ({
			beginn: abrechnungszeitraum.beginn,
			ende: abrechnungszeitraum.ende,
			leistungsart: 'PFLEGEGELD',
			tage: abrechnungszeitraum.tage,
			betrag: berechnePflegegeldTageweise(abrechnungszeitraum, pflegegeldAnspruch)
		}));
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