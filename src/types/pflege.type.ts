import type { SvelteDate } from "svelte/reactivity";
import { Pflegegrad, type Leistungsart } from "./pflege.enums";
import type { Zeitraum } from "./zeitraum.type";

export type  Leistungsposten = {
		beginn: SvelteDate;
		ende: SvelteDate;
		leistungsart: Leistungsart;
		tage: number;
		betrag: number;
	}

export type Leistungskontext = {
	leistungsart: Leistungsart;
	rechnungsbetrag: number;
	pflegegrad: Pflegegrad;
	zeitraum: Zeitraum;
}

export const pflegegradOptions = [
	{ value: Pflegegrad.PFLEGEGRAD_1, label: 'Pflegegrad 1' },
	{ value: Pflegegrad.PFLEGEGRAD_2, label: 'Pflegegrad 2' },
	{ value: Pflegegrad.PFLEGEGRAD_3, label: 'Pflegegrad 3' },
	{ value: Pflegegrad.PFLEGEGRAD_4, label: 'Pflegegrad 4' },
	{ value: Pflegegrad.PFLEGEGRAD_5, label: 'Pflegegrad 5' }
];