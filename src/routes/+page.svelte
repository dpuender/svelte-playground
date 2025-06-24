<script lang="ts">
	import { SvelteDate } from 'svelte/reactivity';
	import { ermittleAbrechnungszeitraumListe, type Zeitraum } from '../types/zeitraum.type';
	import { ermittlePflegegeldTageweise } from '../types/regulierung.pflegegeld';
	import { type Kalender, type Kalendereintrag } from '../types/kalender.type';

	let pflegegeldMap = new Map<string, number>([
		['PG1', 0],
		['PG2', 347],
		['PG3', 599],
		['PG4', 800],
		['PG5', 990]
	]);

	let pflegegrad = $state('');

	let beginnString = $state('');
	let endeString = $state('');

	let beginnDatum = $derived(beginnString ? new SvelteDate(beginnString) : new SvelteDate());
	let endeDatum = $derived(endeString ? new SvelteDate(endeString) : new SvelteDate());

	let abrechnungszeitraumListe = $derived(
		beginnDatum && endeDatum && beginnDatum <= endeDatum
			? ermittleAbrechnungszeitraumListe(beginnDatum, endeDatum)
			: []
	);

	let leistungspostenListe = $derived(
		abrechnungszeitraumListe.length > 0 && pflegegrad
			? ermittlePflegegeldTageweise(abrechnungszeitraumListe, pflegegrad)
			: []
	);
</script>

<container class="grid grid-cols-2 gap-4">
	<div>
		<form>
			<section class="label">Pflegegrad</section>
			<select class="select" bind:value={pflegegrad}>
				<option value="PG1">Pflegegrad 1</option>
				<option value="PG2">Pflegegrad 2</option>
				<option value="PG3">Pflegegrad 3</option>
				<option value="PG4">Pflegegrad 4</option>
				<option value="PG5">Pflegegrad 5</option>
			</select>
			<section class="label">Beginn</section>
			<input type="date" class="input" bind:value={beginnString} />
			<section class="label">Ende</section>
			<input type="date" class="input" bind:value={endeString} />
		</form>
	</div>
	<div>
		{#each leistungspostenListe as leistungsposten}
			<div class="label">Beginn</div>
			<div class="input">{leistungsposten.beginn}</div>
			<div class="label">Ende</div>
			<div class="input">{leistungsposten.ende}</div>
			<div class="label">Leistungsart</div>
			<div class="input">{leistungsposten.leistungsart}</div>
			<div class="label">Tage</div>
			<div class="input">{leistungsposten.tage}</div>
			<div class="label">Betrag</div>
			<div class="input">{leistungsposten.betrag}</div>
			<hr />
		{/each}
	</div>
</container>
