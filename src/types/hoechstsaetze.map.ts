import { Pflegegrad } from "./pflege.enums";

export let PflegegeldMap = new Map<Pflegegrad, number>([
		[Pflegegrad.PFLEGEGRAD_1, 0],
		[Pflegegrad.PFLEGEGRAD_2, 347],
		[Pflegegrad.PFLEGEGRAD_3, 599],
		[Pflegegrad.PFLEGEGRAD_4, 800],
		[Pflegegrad.PFLEGEGRAD_5, 990]
	]);

export let PflegesachleistungsMap = new Map<Pflegegrad, number>([
		[Pflegegrad.PFLEGEGRAD_1, 0],
		[Pflegegrad.PFLEGEGRAD_2, 796],
		[Pflegegrad.PFLEGEGRAD_3, 1497],
		[Pflegegrad.PFLEGEGRAD_4, 1859],
		[Pflegegrad.PFLEGEGRAD_5, 2299]
	]);

export let gemeinsamerJahresbetrag = 3539;
