<script lang="ts">
	import { SvelteDate } from 'svelte/reactivity';
	import {
		ermittleAbrechnungszeitraumListe,
		ermittleAbrechnungszeitraumListeFuerPflegegeld,
		tageInZeitraum
	} from '../../types/zeitraum.type';
	import { ermittlePflegegeld } from '../../types/regulierung.pflegegeld';
	import { pflegegradOptions, type Leistungskontext } from '../../types/pflege.type';
	import { Leistungsart, Pflegegrad } from '../../types/pflege.enums';

	const formatter = new Intl.DateTimeFormat('de-DE');

	let pflegegrad: Pflegegrad | undefined = $state();

	let beginnString = $state('');
	let endeString = $state('');

	let beginnDatum = $derived(beginnString ? new SvelteDate(beginnString) : new SvelteDate());
	let endeDatum = $derived(endeString ? new SvelteDate(endeString) : new SvelteDate());

	let anzahlTageZeitraum = $derived(tageInZeitraum(beginnDatum, endeDatum));

	let abrechnungszeitraumListe = $derived(
		beginnDatum && endeDatum && beginnDatum <= endeDatum
			? ermittleAbrechnungszeitraumListeFuerPflegegeld(beginnDatum, endeDatum)
			: []
	);

	let leistungskontext: Leistungskontext | undefined = $derived(
		pflegegrad
			? {
					leistungsart: Leistungsart.PFLEGEGELD,
					rechnungsbetrag: 0,
					pflegegrad: pflegegrad,
					zeitraum: {
						beginn: beginnDatum,
						ende: endeDatum,
						tage: anzahlTageZeitraum
					}
				}
			: undefined
	);

	let leistungspostenListe = $derived(
		abrechnungszeitraumListe.length > 0 && pflegegrad
			? ermittlePflegegeld(abrechnungszeitraumListe, leistungskontext!)
			: []
	);
</script>

<container class="w-full">
	<div class="card mr-2 ml-2 border-2 p-4">
		<form class="grid grid-cols-3 gap-2">
			<div class="col-span-1">
				<section class="label">Pflegegrad</section>
				<select class="select" bind:value={pflegegrad}>
					<option value={undefined} disabled selected>Bitte auswählen</option>
					{#each pflegegradOptions as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>
			<div>
				<section class="label">Beginn</section>
				<input type="date" class="input" bind:value={beginnString} />
			</div>
			<div>
				<section class="label">Ende</section>
				<input type="date" class="input" bind:value={endeString} />
			</div>
		</form>
	</div>

	{#each leistungspostenListe as leistungsposten}
		<div class="card preset-tonal-secondary m-2 grid grid-cols-5 gap-1 border-2 p-4">
			<div>
				<div class="label">Beginn</div>
				<div class="input">{formatter.format(leistungsposten.beginn)}</div>
			</div>
			<div>
				<div class="label">Ende</div>
				<div class="input">{formatter.format(leistungsposten.ende)}</div>
			</div>
			<div>
				<div class="label">Leistungsart</div>
				<div class="input">{Leistungsart[leistungsposten.leistungsart]}</div>
			</div>
			<div>
				<div class="label">Tage</div>
				<div class="input">{leistungsposten.tage}</div>
			</div>
			<div>
				<div class="label">Betrag</div>
				<div class="input">{leistungsposten.betrag.toFixed(2)} €</div>
			</div>
		</div>
	{/each}
</container>
