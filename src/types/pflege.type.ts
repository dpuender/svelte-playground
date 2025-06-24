import type { SvelteDate } from "svelte/reactivity";
import type { Pflegegrad } from "./pflege.enums";
import type { Zeitraum } from "./zeitraum.type";

export type  Leistungsposten = {
		beginn: SvelteDate;
		ende: SvelteDate;
		leistungsart: string;
		tage: number;
		betrag: number;
	}

export type Kontext = {
	pflegegrad: Pflegegrad;
	zeitraum: Zeitraum;
}