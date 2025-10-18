<script lang="ts">
	import { SvelteDate } from 'svelte/reactivity';
	import { roundTo } from '../../types/util';
	import { addDays, fuelleKalender, type Kalender } from '../../types/kalender.type';
	import { ermittlePflegegeld } from '../../types/regulierung.pflegegeld';
	import { Leistungsart, Pflegegrad, StringToLeistungsartMap } from '../../types/pflege.enums';
	import { pflegegradOptions, type Leistungskontext } from '../../types/pflege.type';
	import { ermittleAbrechnungszeitraumListe, type Zeitraum } from '../../types/zeitraum.type';

	const formatter = new Intl.DateTimeFormat('de-DE');

	let gemeinsamerJahresbetrag = $state(3539);
	let pflegegrad: Pflegegrad | undefined = $state();

	let kurzzeitpflegeTage = $state(56);
	let verhinderungspflegeTage = $state(56);

	let beginnString = $state('');
	let endeString = $state('');

	let rechnungsbetrag = $state(0);

	let leistungsart = $state('');

	let beginnDate = $derived(beginnString ? new SvelteDate(beginnString) : new SvelteDate());
	let endeDate = $derived(endeString ? new SvelteDate(endeString) : new SvelteDate());

	let tageInZeitraum = $derived(
		(endeDate.getTime() - beginnDate.getTime()) / (1000 * 60 * 60 * 24) + 1
	);

	let tagessatz = $derived(rechnungsbetrag / tageInZeitraum);

	let tageAusgeschoepft = $derived(
		leistungsart == 'VHP'
			? tageInZeitraum > verhinderungspflegeTage
			: tageInZeitraum > kurzzeitpflegeTage
	);

	let budgetAusgeschoepft = $derived(rechnungsbetrag > gemeinsamerJahresbetrag);

	let erstattungsbetrag = $derived(
		roundTo(
			ermittleErstattungsbetrag(
				rechnungsbetrag,
				tagessatz,
				leistungsart,
				tageAusgeschoepft,
				budgetAusgeschoepft
			),
			2
		)
	);

	let ablehnungsbetrag = $derived(
		roundTo(ermittleAblehnungsbetrag(erstattungsbetrag, rechnungsbetrag), 2)
	);
	let erstattungszeitraum = $derived(
		roundTo(ermittleErstattungszeitraum(erstattungsbetrag, tagessatz), 2)
	);

	let gemeinsamerJahresbetragRest = $derived(
		roundTo(gemeinsamerJahresbetrag - erstattungsbetrag, 2)
	);

	let kurzzeitpflegeTageRest = $derived(
		roundTo(
			leistungsart == 'KZP' ? kurzzeitpflegeTage - erstattungszeitraum : kurzzeitpflegeTage,
			2
		)
	);

	let verhinderungspflegeTageRest = $derived(
		roundTo(
			leistungsart == 'VHP'
				? verhinderungspflegeTage - erstattungszeitraum
				: verhinderungspflegeTage,
			2
		)
	);

	let endeErstattungszeitraum = $derived(addDays(beginnDate, erstattungszeitraum));

	let erstattungszeitraumObjekt: Zeitraum = $derived({
		beginn: beginnDate,
		ende: endeErstattungszeitraum,
		tage: erstattungszeitraum
	});

	let leistungskontext: Leistungskontext = $derived({
		leistungsart: StringToLeistungsartMap.get(leistungsart),
		rechnungsbetrag: rechnungsbetrag,
		pflegegrad: pflegegrad,
		zeitraum: {
			beginn: beginnDate,
			ende: endeDate,
			tage: tageInZeitraum
		},
		erstattungsZeitraum: erstattungszeitraumObjekt
	});

	function ermittleErstattungsbetrag(
		rechnungsbetrag: number,
		tagessatz: number,
		leistungsart: string,
		tageAusgeschoepft: boolean,
		budgetAusgeschoepft: boolean
	): number {
		if (tageAusgeschoepft) {
			let betragNachTagen =
				leistungsart == 'VHP'
					? verhinderungspflegeTage * tagessatz
					: kurzzeitpflegeTage * tagessatz;
			return betragNachTagen > gemeinsamerJahresbetrag ? gemeinsamerJahresbetrag : betragNachTagen;
		} else if (budgetAusgeschoepft) {
			return gemeinsamerJahresbetrag;
		} else {
			return rechnungsbetrag;
		}
	}

	function ermittleAblehnungsbetrag(erstattungsbetrag: number, rechnungsbetrag: number): number {
		if (rechnungsbetrag > 0) {
			return rechnungsbetrag - erstattungsbetrag;
		} else {
			return 0;
		}
	}

	function ermittleErstattungszeitraum(erstattungsbetrag: number, tagessatz: number): number {
		if (erstattungsbetrag > 0) {
			return erstattungsbetrag / tagessatz;
		}
		return 0;
	}

	let kalender: Kalender = $derived(
		fuelleKalender(
			{ beginn: beginnDate, ende: endeDate, tage: tageInZeitraum },
			erstattungszeitraum
		)
	);

	let abrechnungszeitraumListe = $derived(
		beginnDate && endeDate && beginnDate <= endeDate
			? ermittleAbrechnungszeitraumListe(beginnDate, endeDate)
			: []
	);

	let leistungspostenListe = $derived(
		ermittlePflegegeld(abrechnungszeitraumListe, leistungskontext, kalender)
	);
</script>

<div class="card preset-tonal-secondary mr-2 ml-2 border-2 p-4">
	<section class="label">Pflegegrad</section>
	<select class="select" bind:value={pflegegrad}>
		<option value={undefined} disabled selected>Bitte auswählen</option>
		{#each pflegegradOptions as option}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
</div>
<div class="grid w-full grid-cols-2 gap-1 p-2">
	<div id="input" class="card preset-tonal-secondary border-2 p-4">
		<form class="grid grid-cols-2 gap-2">
			<div class="card col-span-2">
				<label class="label" for="restbetrag">Verfügbarer gemeinsamer Jahresbetrag</label>
				<input class="input" bind:value={gemeinsamerJahresbetrag} />
			</div>
			<div>
				<label class="label" for="restbetrag">Kurzzeitpflege</label>
				<input class="input" bind:value={kurzzeitpflegeTage} />
			</div>
			<div>
				<label class="label" for="restbetrag">Verhinderungspflege</label>
				<input class="input" bind:value={verhinderungspflegeTage} />
			</div>
			<div class="card">
				<label class="label" for="beginn">Beginn</label>
				<input class="input" type="date" bind:value={beginnString} />
			</div>
			<div class="card">
				<label class="label" for="ende">Ende</label>
				<input class="input" type="date" bind:value={endeString} />
			</div>
			<div class="card">
				<label class="label" for="leistungsart">Leistungsart</label>
				<select id="leistungsart" class="select" bind:value={leistungsart}>
					<option value="VHP">Verhinderungspflege</option>
					<option value="KZP">Kurzzeitpflege</option>
				</select>
			</div>
			<div class="card">
				<label class="label" for="rechnungsbetrag">Rechnungsbetrag</label>
				<input class="input" bind:value={rechnungsbetrag} />
			</div>
		</form>
	</div>

	<div id="result" class="card preset-tonal-secondary border-2 p-4">
		<div class="grid grid-cols-2 gap-2">
			<div class="card col-span-2">
				<div class="label">Restanspruch gemeinsamer Jahresbetrag</div>
				<div class="input">{gemeinsamerJahresbetragRest} €</div>
			</div>
			<div class="card">
				<div class="label">Restanspruch Kurzzeitpflege</div>
				<div class="input">{kurzzeitpflegeTageRest} Tage</div>
			</div>
			<div class="card">
				<div class="label">Restanspruch Verhinderungspflege</div>
				<div class="input">{verhinderungspflegeTageRest} Tage</div>
			</div>

			<div class="card">
				<div class="label">Behandlungszeitraum</div>
				<div class="input">{tageInZeitraum} Tage</div>
			</div>

			<div class="card">
				<div class="label">Erstattungszeitraum</div>
				<div class="input">{erstattungszeitraum} Tage</div>
			</div>

			<div class="card">
				<div class="label">Ablehnungsbetrag</div>
				<div class="input">{ablehnungsbetrag} €</div>
			</div>

			<div class="card">
				<div class="label">Erstattungsbetrag</div>
				<div class="input">{erstattungsbetrag} €</div>
			</div>
		</div>
	</div>
</div>
{#each leistungspostenListe as leistungsposten}
	<div class="card preset-tonal-secondary mr-2 ml-2 grid grid-cols-5 gap-1 border-2 p-4">
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
