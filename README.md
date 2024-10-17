# ETH-ADV Project - Smart Contract

## 1. Overview

Il contratto **nftProject** è uno smart contract basato su Ethereum che permette la creazione, visualizzazione e scambio di NFT utilizzando Chainlink VRF per garantire l'assegnazione casuale e sicura degli ID degli NFT. 
Il contratto gestisce una collezione limitata di NFT, ognuno con un set di metadati associati (nome della rivista, autore, descrizione e nome della collezione).

## 2. Purpose

Questo progetto ha come obiettivo di fornire alle aziende uno strumento affidabile per creare e vendere NFT unici che garantiscano autenticità e tracciabilità dei loro prodotti. Per un'azienda nel settore della divulgazione scientifica, la creazione di NFT potrebbe rappresentare un'opportunità di monetizzazione, di coinvolgimento e di espansione del pubblico attraverso collezionabili digitali unici. 


### Vantaggi principali:
- **Autenticità garantita**: Gli NFT creati tramite questo contratto sono legati a un ID univoco generato in modo trasparente e casuale (garantito da Chainlink VFR).
- **Tracciabilità**: Ogni transazione relativa agli NFT è registrata su blockchain, rendendo la provenienza e il passaggio di proprietà completamente tracciabili.
- **Monetizzazione**: Le aziende possono vendere NFT e ricevere direttamente pagamenti in Ether tramite le fee di transazione.

## 3. Technical Choice

Il contratto utilizza **OpenZeppelin** per l'implementazione dello standard ERC721 (NFT) e **Chainlink VRF** per la generazione di numeri casuali sicuri. 
- **ERC721**: Il contratto implementa l'interfaccia standard per NFT, rendendo i token compatibili con vari marketplace e wallet.
- **Chainlink VRF**: Utilizzato per richiedere numeri casuali in modo verificabile, al fine di assegnare ID unici agli NFT creati.
- **Exchange**: Gli utenti possono scambiare NFT.


## Development Environment
- **Solidity Version**: ^0.8.20.
- **Events for Transparency**: Le principali azioni del contratto sono tracciate attraverso eventi.
  
## Deployment
- **Deployment Order**: Il contratto segue una sequenza di deploy. È importante che i parametri come subscriptionId e keyHash di Chainlink VRF siano corretti prima del deploy, in modo che il contratto funzioni correttamente e le comunicazioni tra i moduli siano gestite correttamente.


