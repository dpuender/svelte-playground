<script lang="ts">
	import { SvelteDate } from 'svelte/reactivity';
	import {
		ermittleAbrechnungszeitraumListe,
		tageInZeitraum,
		type Zeitraum
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
			? ermittleAbrechnungszeitraumListe(beginnDatum, endeDatum)
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
			? ermittlePflegegeld(abrechnungszeitraumListe, pflegegrad, leistungskontext!)
			: []
	);
</script>

<container class="grid w-full grid-cols-1 gap-2 p-2">
	<div class="card border-2 p-6">
		<form>
			<section class="label">Pflegegrad</section>
			<select class="select" bind:value={pflegegrad}>
				<option value={undefined} disabled selected>Bitte auswählen</option>
				{#each pflegegradOptions as option}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
			<section class="label">Beginn</section>
			<input type="date" class="input" bind:value={beginnString} />
			<section class="label">Ende</section>
			<input type="date" class="input" bind:value={endeString} />
		</form>
	</div>

	{#each leistungspostenListe as leistungsposten}
		<div class="card grid grid-cols-5 gap-1 border-2 p-2">
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
