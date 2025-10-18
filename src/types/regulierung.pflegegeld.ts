import type { Leistungskontext, Leistungsposten } from "./pflege.type";
import type { Zeitraum } from "./zeitraum.type";
import { PflegegeldMap, PflegesachleistungsMap } from "./hoechstsaetze.map";
import { Leistungsart, PflegegeldAnspruchart, type Pflegegrad } from "./pflege.enums";
import type { SvelteDate } from "svelte/reactivity";
import { addDays, type Kalender } from "./kalender.type";


export function ermittlePflegegeld(abrechnungszeitraumListe: Array<Zeitraum>, leistungskontext: Leistungskontext, kalender?: Kalender): Array<Leistungsposten> {
    
	if (leistungskontext.pflegegrad === undefined) {
		return [];
	}

    const pflegegeldAnspruch = PflegegeldMap.get(leistungskontext.pflegegrad);
	let pflegesachleistungsAnspruch = PflegesachleistungsMap.get(leistungskontext.pflegegrad);

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
			betrag: berechnePflegegeld(abrechnungszeitraum, pflegegeldAnspruch, leistungskontext, kalender)
		}));
	}


function berechnePflegegeld(abrechnungszeitraum: Zeitraum, pflegegeldAnspruch: number, leistungskontext: Leistungskontext, kalender?: Kalender) {

	if (leistungskontext.pflegegrad === undefined) {
		return 0;
	}

	let pflegesachleistungsAnspruch = PflegesachleistungsMap.get(leistungskontext.pflegegrad)

	if (pflegesachleistungsAnspruch === undefined) {
		pflegesachleistungsAnspruch = 0;
	}

	let pflegesachleistungsBetrag = 0;
	if(leistungskontext.leistungsart === Leistungsart.PFLEGESACHLEISTUNG) {
		pflegesachleistungsBetrag = leistungskontext.rechnungsbetrag;
	}

    let pflegegeldTageweise = berechnePflegegeldTageweise(abrechnungszeitraum, pflegegeldAnspruch, kalender);
    
	let pflegegeldAnteilig = berechnePflegegeldAnteilig(pflegegeldAnspruch, pflegesachleistungsAnspruch, pflegesachleistungsBetrag);

    if (pflegegeldTageweise > pflegegeldAnteilig) {
		return pflegegeldAnteilig;
	} else {
		return pflegegeldTageweise;
	}
}

function berechnePflegegeldTageweise(zeitraum: Zeitraum, pflegegeldAnspruch: number, kalender?: Kalender): number {
	let pflegegeldErstattungsbetrag = 0;	
	if (pflegegeldAnspruch === undefined) {
			return pflegegeldErstattungsbetrag;
		}

		console.log('Kalender: ', kalender)

		// Pflegegeldanspruch pro Tag im Zeitraum ermitteln
		let pflegegeldAnspruchsTageMap = new Map<SvelteDate, PflegegeldAnspruchart>();

		if (kalender) {

			kalender.kalenderEintraege.forEach((eintrag) => {
				pflegegeldAnspruchsTageMap.set(eintrag.datum, eintrag.anspruch);
			})

			console.log('Ich versuche hälftiges Pflegegeld zu berechnen!')

			pflegegeldAnspruchsTageMap.forEach((anspruch, date) => {
				if (date < zeitraum.beginn) {
					return;
				}
	
				if (date > addDays(zeitraum.ende, 1)) {
					return;
				}
	
				if (anspruch == PflegegeldAnspruchart.HALBER_ANSPRUCH_WEGEN_KZP_VHP){
					pflegegeldErstattungsbetrag += (pflegegeldAnspruch / 30 * 0.5);
					
				} else {
					pflegegeldErstattungsbetrag += (pflegegeldAnspruch / 30);
				}
				console.log(date, anspruch, pflegegeldErstattungsbetrag)
			})

			return Math.min(pflegegeldAnspruch, pflegegeldErstattungsbetrag);
		}


		//Sonderfall Februar
		if (zeitraum.beginn.getMonth() === 1) {
			const year = zeitraum.beginn.getFullYear();
			const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
			const maxDaysInFebruary = isLeapYear ? 29 : 28;
			if (zeitraum.tage === maxDaysInFebruary) {
				pflegegeldErstattungsbetrag = pflegegeldAnspruch;
			} else {
				pflegegeldErstattungsbetrag = (pflegegeldAnspruch / 30) * zeitraum.tage;
			}
		} else {
			console.log('Zeitraum.tage: ', zeitraum.tage)
	
			pflegegeldErstattungsbetrag = (pflegegeldAnspruch / 30) * zeitraum.tage;
		}

		console.log('Erstattungsbetrag: ', pflegegeldErstattungsbetrag)

		return Math.min(pflegegeldAnspruch, pflegegeldErstattungsbetrag);
	}

function berechnePflegegeldAnteilig( pflegegeldAnspruch: number, pflegesachleistungsAnspruch: number, pflegesachleistungsBetrag: number): number {	
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