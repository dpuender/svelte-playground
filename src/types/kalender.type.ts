import { SvelteDate } from "svelte/reactivity";
import { PflegegeldAnspruchart } from "./pflege.enums";
import type { Zeitraum } from "./zeitraum.type";

export type Kalender = {
    kalenderEintraege: Kalendereintrag[];
}

export type Kalendereintrag = {
    datum: SvelteDate;
    anspruch: PflegegeldAnspruchart;
}

export function fuelleKalender(
		zeitraum: Zeitraum,
		erstattungszeitraum: number
	) {
		let kalender: Kalender = {
			kalenderEintraege: []
		};

        kalender.kalenderEintraege.push({
            datum: zeitraum.beginn,
            anspruch: PflegegeldAnspruchart.VOLL_AUFNAHMETAG
        })

        kalender.kalenderEintraege.push({
            datum: zeitraum.ende,
            anspruch: PflegegeldAnspruchart.VOLL_ENTLASSTAG
        })

		for (let i = 1; i <= erstattungszeitraum; i++) {
            kalender.kalenderEintraege.push({
                datum: addDays(zeitraum.beginn, i),
                anspruch: PflegegeldAnspruchart.HALBER_ANSPRUCH_WEGEN_KZP_VHP
            })
		}

		return kalender;
		}

export function getMonatAusKalender (monat: number, kalender: Kalender): Kalender {
    let filteredKalender: Kalender = {
        kalenderEintraege: []
    };

    kalender.kalenderEintraege.forEach(eintrag => {
        if (eintrag.datum.getMonth() === monat) {
            filteredKalender.kalenderEintraege.push(eintrag);
        }
    });

    return filteredKalender;

}

function addDays(date: SvelteDate, days: number): SvelteDate {
		let resultDate = new SvelteDate(date);
		resultDate.setDate(resultDate.getDate() + days);
		return resultDate;
	}