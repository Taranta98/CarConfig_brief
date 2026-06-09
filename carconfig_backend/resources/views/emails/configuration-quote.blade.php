<x-mail::message>

# Il tuo preventivo

Ciao {{ $user->first_name }},

abbiamo preparato il tuo preventivo personalizzato per:

## {{ $vehicle->brand }} {{ $vehicle->model }}

---

## Dettagli

In allegato trovi il documento PDF contenente:

* configurazione del veicolo
* optional selezionati
* prezzo complessivo
* condizioni commerciali

<x-mail::panel>
Visualizza il preventivo completo aprendo il file PDF allegato a questa email.
</x-mail::panel>

---

## Assistenza e modifiche

Se desideri apportare modifiche alla configurazione o ricevere ulteriori informazioni, puoi rispondere direttamente a questa email. Il nostro team è a tua disposizione.

---

Grazie per la fiducia,

**{{ config('app.name') }}**

<x-mail::subcopy>
Email automatica. In caso di errore nella ricezione, è possibile ignorare questo messaggio.
</x-mail::subcopy>

</x-mail::message>