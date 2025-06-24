import { SvelteDate } from "svelte/reactivity";

export type Zeitraum = {
    beginn: SvelteDate;
    ende: SvelteDate;
    tage: number;
}

export function ermittleAbrechnungszeitraumListe(beginn: SvelteDate, ende: SvelteDate): Array<Zeitraum> {
		const abrechnungszeitraumListe: Array<Zeitraum> = [];

		// Use a standard `Date` for the iterator to avoid mutating reactive state inside a derived computation.
		let current = new Date(beginn.getFullYear(), beginn.getMonth(), 1);
		while (current <= ende) {
			let monthBegin = new SvelteDate(current.getFullYear(), current.getMonth(), 1);
			let monthEnd = new SvelteDate(current.getFullYear(), current.getMonth() + 1, 0);

			let actualBegin = monthBegin < beginn ? beginn : monthBegin;
			let actualEnd = monthEnd > ende ? ende : monthEnd;

			const oneDay = 1000 * 60 * 60 * 24;
			const diffTime = Math.abs(actualEnd.getTime() - actualBegin.getTime());
			const diffDays = Math.ceil(diffTime / oneDay) + 1;

			let zeitraum: Zeitraum = {
				beginn: actualBegin,
				ende: actualEnd,
				tage: diffDays
			};
			abrechnungszeitraumListe.push(zeitraum);

			current.setMonth(current.getMonth() + 1);
		}
		return abrechnungszeitraumListe;
	}

export function enthaeltZeitraum (zeitraumInput : Zeitraum, zeitraum : Zeitraum ) : boolean {
    return zeitraumInput.beginn >= zeitraum.beginn && zeitraumInput.ende <= zeitraum.ende;
}

export function schneidetZeitraum (zeitraumInput : Zeitraum, zeitraum : Zeitraum ) : boolean {
   if (zeitraumInput.beginn >= zeitraum.beginn && zeitraumInput.ende >= zeitraum.ende) {
    return true;
   } else if (zeitraumInput.beginn <= zeitraum.beginn && zeitraumInput.ende <= zeitraum.ende) {
    return true;
   } else {
    return false;
   }
}