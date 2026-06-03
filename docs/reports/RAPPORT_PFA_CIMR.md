# RAPPORT DE PROJET DE FIN D'ANNÉE

---

<div align="center">

**ÉCOLE MAROCAINE DES SCIENCES DE L'INGÉNIEUR**
**EMSI — Membre de HONORIS UNITED UNIVERSITIES**

**Filière 4IIR — Ingénierie Informatique et Réseaux**
**Année Universitaire 2024–2025**

---

## Conception et Développement d'une Plateforme Digitale de Gestion des Retraites
### Cas d'étude : Système d'Information de la CIMR

---

**Réalisé par :**
**Mharrech Iliass**

**Encadrant Pédagogique :**
**Pr. [Nom de l'Encadrant]**

**Date de soumission :** Mai 2025

</div>

---

## Dédicaces

Je dédie ce travail, avant tout, à **Allah, le Tout-Puissant**, source de toute réussite et lumière de mon chemin. Sans Sa miséricorde et Sa guidance, rien n'aurait été possible.

À mes **chers parents**, piliers de mon existence, pour leur amour inconditionnel, leurs sacrifices silencieux et leur foi indéfectible en moi. Vous êtes et resterez ma plus grande motivation.

À ma **famille** dans son ensemble, pour leur soutien moral, leurs encouragements sincères et leur présence chaleureuse à chaque étape de mon parcours.

À mes **amis** et **camarades de promotion**, qui ont partagé avec moi les défis, les doutes et les réussites de cette aventure académique.

À tous mes **enseignants de l'EMSI**, qui, au fil des années, m'ont transmis leur savoir avec passion, m'ont guidé avec exigence et encouragé à aller toujours plus loin.

> *« À ceux qui m'ont offert la liberté de rêver, la force de réussir, et la fierté d'avancer : que ce travail soit le reflet de ma gratitude et de mon engagement envers chaque pas parcouru. »*

---

## Remerciements

Je tiens à exprimer ma profonde gratitude à mon **encadrant pédagogique**, pour son accompagnement rigoureux, son écoute bienveillante et ses conseils éclairés, qui ont contribué à enrichir considérablement ce projet.

Mes sincères remerciements vont également à l'ensemble du **corps professoral de l'EMSI**, dont l'expertise et la disponibilité ont jalonné mon parcours d'apprentissage.

Je remercie chaleureusement toute la **direction de la filière 4IIR** pour la qualité de la formation dispensée et les opportunités d'apprentissage offertes tout au long de cette année universitaire.

À chacun d'entre vous, je dis **merci**, avec respect, fierté et émotion.

---

## Résumé

Ce rapport présente la conception et la réalisation d'une **plateforme digitale de gestion des retraites** inspirée du contexte métier de la **Caisse Interprofessionnelle Marocaine de Retraite (CIMR)**. Le projet répond à une problématique majeure : la modernisation des systèmes d'information dédiés à la gestion des retraites privées au Maroc, traditionnellement basés sur des outils hétérogènes, peu intégrés et difficilement évolutifs.

La solution proposée est une **application web full-stack** construite autour d'une architecture **microservices**, garantissant la modularité, la scalabilité et la maintenabilité. Côté backend, neuf microservices Spring Boot indépendants (authentification, affiliation, contributions, liquidations, paiements, réversions, administration, orchestrateur saga et API Gateway) communiquent via REST et événements **Apache Kafka**. Côté frontend, une **Single Page Application** moderne développée en **React 19 + TypeScript + Vite** offre une expérience utilisateur fluide, responsive et accessible aux différents profils (affiliés, agents, administrateurs).

Le système couvre l'intégralité du cycle de vie d'un dossier de retraite : affiliation des adhérents, déclaration mensuelle des cotisations avec calcul des points, simulation prédictive du montant de la pension à la retraite, dépôt et instruction des demandes de liquidation, exécution des paiements, gestion des pensions de réversion pour les ayants droit, audit conforme à la **CNDP** (loi 09-08) et notifications en temps réel.

Les technologies principales mises en œuvre incluent **Spring Boot 3.2, Spring Cloud Gateway, Spring Security (JWT), Apache Kafka 7.5, PostgreSQL 15, Flyway, React 19, TanStack Query, Tailwind CSS, Zod, Docker et Docker Compose**.

Les résultats clés obtenus sont : une **architecture modulaire** déployable en conteneurs, un **moteur de simulation de pension** calculant projections nettes/brutes et scénarios de rachat, un **workflow de liquidation traçable** avec gestion documentaire, un **journal d'audit immuable** et une **interface utilisateur** complète couvrant 18 pages fonctionnelles.

**Mots-clés :** Microservices, Spring Boot, React, JWT, Apache Kafka, PostgreSQL, Docker, Retraite, CIMR, Simulation, Audit, CNDP.

---

## Abstract

This report presents the design and implementation of a **digital pension management platform** inspired by the business context of the **Caisse Interprofessionnelle Marocaine de Retraite (CIMR)**. The project addresses a major challenge: modernizing information systems dedicated to private pension management in Morocco, traditionally based on heterogeneous, poorly integrated and hardly scalable tools.

The proposed solution is a **full-stack web application** built around a **microservices architecture**, ensuring modularity, scalability and maintainability. The backend consists of nine independent Spring Boot microservices (authentication, affiliation, contributions, liquidations, payments, reversions, administration, saga orchestrator and API Gateway) communicating via REST and **Apache Kafka** events. The frontend is a modern **Single Page Application** developed in **React 19 + TypeScript + Vite**, offering a smooth, responsive and accessible user experience.

The system covers the entire lifecycle of a retirement file: member affiliation, monthly contribution declaration with point calculation, predictive pension simulation, liquidation request submission and processing, payment execution, survivor pension management, **CNDP**-compliant audit (Moroccan law 09-08), and real-time notifications.

Main technologies used: **Spring Boot 3.2, Spring Cloud Gateway, Spring Security (JWT), Apache Kafka 7.5, PostgreSQL 15, Flyway, React 19, TanStack Query, Tailwind CSS, Zod, Docker and Docker Compose**.

**Keywords:** Microservices, Spring Boot, React, JWT, Apache Kafka, PostgreSQL, Docker, Pension, CIMR, Simulation, Audit.

---

## Liste des abréviations

| Abréviation | Signification |
|---|---|
| **API** | Application Programming Interface |
| **CIMR** | Caisse Interprofessionnelle Marocaine de Retraite |
| **CIN** | Carte d'Identité Nationale |
| **CNDP** | Commission Nationale de contrôle de la protection des Données à caractère Personnel |
| **CORS** | Cross-Origin Resource Sharing |
| **CRUD** | Create, Read, Update, Delete |
| **DTO** | Data Transfer Object |
| **HTTPS** | HyperText Transfer Protocol Secure |
| **IAM** | Identity and Access Management |
| **JPA** | Java Persistence API |
| **JSON** | JavaScript Object Notation |
| **JWT** | JSON Web Token |
| **MVC** | Model-View-Controller |
| **ORM** | Object-Relational Mapping |
| **PFA** | Projet de Fin d'Année |
| **REST** | Representational State Transfer |
| **RGPD** | Règlement Général sur la Protection des Données |
| **SPA** | Single Page Application |
| **SQL** | Structured Query Language |
| **UML** | Unified Modeling Language |
| **UUID** | Universally Unique Identifier |
| **VM** | Virtual Machine |

---

## Liste des figures

| Figure | Titre | Page |
|---|---|---|
| Figure 1 | Logo CIMR | 4 |
| Figure 2 | Architecture globale du système | 12 |
| Figure 3 | Diagramme de cas d'utilisation général | 18 |
| Figure 4 | Diagramme de classes du domaine | 21 |
| Figure 5 | Architecture microservices détaillée | 23 |
| Figure 6 | Diagramme de séquence – Connexion utilisateur | 25 |
| Figure 7 | Diagramme de séquence – Demande de liquidation | 26 |
| Figure 8 | Schéma de la base de données | 28 |
| Figure 9 | Structure du code backend | 32 |
| Figure 10 | Structure du code frontend | 33 |
| Figure 11 | Page de connexion | 35 |
| Figure 12 | Tableau de bord | 36 |
| Figure 13 | Page de simulation de pension | 37 |
| Figure 14 | Formulaire de liquidation | 38 |
| Figure 15 | Architecture de déploiement Docker | 42 |

## Liste des tableaux

| Tableau | Titre | Page |
|---|---|---|
| Tableau 1 | Comparatif des architectures (monolithique vs microservices) | 11 |
| Tableau 2 | Comparatif Spring Boot vs Node.js vs .NET | 14 |
| Tableau 3 | Comparatif React vs Angular vs Vue | 15 |
| Tableau 4 | Besoins fonctionnels par acteur | 19 |
| Tableau 5 | Besoins non fonctionnels | 20 |
| Tableau 6 | Liste des microservices et leurs responsabilités | 24 |
| Tableau 7 | Plan de tests | 40 |

---

# Table des matières

1. [Introduction Générale](#introduction-générale)
2. [Chapitre 1 : Contexte général du projet](#chapitre-1--contexte-général-du-projet)
3. [Chapitre 2 : État de l'art](#chapitre-2--état-de-lart)
4. [Chapitre 3 : Analyse et conception](#chapitre-3--analyse-et-conception)
5. [Chapitre 4 : Technologies utilisées](#chapitre-4--technologies-utilisées)
6. [Chapitre 5 : Implémentation](#chapitre-5--implémentation)
7. [Chapitre 6 : Tests et Validation](#chapitre-6--tests-et-validation)
8. [Chapitre 7 : Déploiement](#chapitre-7--déploiement)
9. [Chapitre 8 : Guide Utilisateur](#chapitre-8--guide-utilisateur)
10. [Conclusion et Perspectives](#conclusion-et-perspectives)
11. [Références](#références)
12. [Annexes](#annexes)

---

# Introduction Générale

Dans un contexte de **transformation digitale accélérée** et de **vieillissement progressif de la population active marocaine**, la modernisation des systèmes d'information dédiés à la **gestion des retraites** est devenue un enjeu stratégique majeur. Les caisses de retraite, qu'elles soient publiques ou privées, gèrent des volumes considérables d'affiliés, des flux financiers significatifs et des règles métier complexes mêlant droit social, calculs actuariels et obligations réglementaires.

La **Caisse Interprofessionnelle Marocaine de Retraite (CIMR)**, première caisse de retraite privée au Maroc, gère la retraite complémentaire de plus de **800 000 affiliés** et verse mensuellement des pensions à plus de **200 000 allocataires**. Son système d'information historique, longtemps basé sur des applications mainframe et des outils bureautiques, montre aujourd'hui ses limites face aux exigences modernes : **accessibilité multicanal** (web, mobile), **temps réel**, **traçabilité réglementaire** (loi 09-08 sur la protection des données personnelles, supervisée par la **CNDP**), **scalabilité** et **interopérabilité** avec les écosystèmes externes (CNSS, banques, employeurs).

C'est dans ce contexte que s'inscrit le présent **Projet de Fin d'Année (PFA)**, dont l'ambition est de **concevoir et développer une plateforme digitale moderne** couvrant l'intégralité du parcours d'un affilié, depuis son inscription jusqu'à la liquidation de sa pension, en intégrant les meilleures pratiques contemporaines du génie logiciel : **architecture microservices**, **DevOps**, **sécurité by design** et **expérience utilisateur soignée**.

Au-delà de la simple réponse à un besoin métier, ce projet constitue une **démarche d'apprentissage pratique** des technologies les plus demandées sur le marché : Spring Boot, React, Docker, Kafka, PostgreSQL. Il représente également un exercice de **synthèse pluridisciplinaire** mobilisant des compétences en analyse, conception, développement, sécurité, base de données, et gestion de projet.

Ce rapport présente, de manière structurée, l'ensemble du travail réalisé : depuis l'analyse du contexte et des besoins, jusqu'à la mise en œuvre technique, en passant par la conception de l'architecture, les choix technologiques, les phases de tests et les perspectives d'évolution.

---

# Chapitre 1 : Contexte général du projet

## 1.1 Introduction

Ce premier chapitre pose les fondations du projet. Il présente le **contexte métier** dans lequel s'inscrit la solution (la gestion des retraites complémentaires au Maroc), expose la **problématique** adressée, formule les **objectifs spécifiques** poursuivis, délimite la **portée** du travail et présente la **méthodologie globale** adoptée.

## 1.2 Contexte métier : la retraite complémentaire au Maroc

### 1.2.1 Le système de retraite marocain

Le système de retraite marocain repose sur une architecture à **deux étages** :

- **Premier étage — Retraite de base obligatoire** : géré par la **CNSS** (Caisse Nationale de Sécurité Sociale) pour le secteur privé et la **CMR** (Caisse Marocaine des Retraites) pour le secteur public. Il garantit un minimum vital aux retraités.
- **Second étage — Retraite complémentaire** : essentiellement assurée par la **CIMR** pour les salariés du secteur privé. Cette retraite, capitalisée en **points**, vient compléter la pension de base.

### 1.2.2 Présentation de la CIMR

La **Caisse Interprofessionnelle Marocaine de Retraite (CIMR)**, créée en 1949, est la principale caisse de retraite complémentaire privée du Maroc. Elle fonctionne selon le **système de retraite par points** :

- L'**affilié** (salarié) et l'**adhérent** (entreprise) cotisent mensuellement sur la base d'une **assiette salariale** ;
- Les cotisations sont converties en **points de retraite** selon une **valeur d'achat du point** révisée annuellement ;
- À la retraite, le nombre total de points accumulés est multiplié par la **valeur de service du point** pour obtenir la pension annuelle.

### 1.2.3 Acteurs du système

| Acteur | Rôle |
|---|---|
| **Affilié** | Salarié inscrit à la CIMR, principal bénéficiaire |
| **Adhérent** | Entreprise employeuse qui cotise pour ses salariés |
| **Agent CIMR** | Employé chargé de l'instruction des dossiers |
| **Administrateur** | Responsable de la gestion du système d'information |
| **Ayant droit** | Conjoint(e), enfant orphelin bénéficiaire d'une pension de réversion |

## 1.3 Problématique

Les systèmes d'information existants dans le domaine de la gestion des retraites souffrent de plusieurs limitations majeures :

1. **Architecture monolithique vieillissante** : applications héritées difficilement maintenables et peu évolutives ;
2. **Manque d'accessibilité** : absence d'interface web moderne pour les affiliés, qui doivent se déplacer en agence pour la plupart des opérations ;
3. **Processus papier** : les demandes de liquidation reposent encore largement sur des dossiers physiques, source d'erreurs et de retards ;
4. **Faible traçabilité** : difficulté à reconstituer l'historique des actions, posant des problèmes de conformité avec la **loi 09-08** sur la protection des données personnelles ;
5. **Pas de simulation prédictive** : l'affilié ne dispose pas d'outils pour estimer sa future pension et anticiper son départ à la retraite ;
6. **Communication limitée** : les notifications aux affiliés sont essentiellement faites par courrier postal.

**Problématique centrale** :

> *Comment concevoir et développer une plateforme digitale moderne, sécurisée et évolutive, capable de couvrir l'intégralité du cycle de vie d'un dossier de retraite — de l'affiliation à la liquidation — tout en garantissant la traçabilité réglementaire, la performance et une expérience utilisateur fluide pour l'ensemble des acteurs (affiliés, agents, administrateurs) ?*

## 1.4 Objectifs spécifiques

Le projet vise à atteindre les objectifs suivants :

- **O1 — Concevoir une architecture modulaire** basée sur les microservices, permettant le développement et le déploiement indépendant de chaque domaine fonctionnel.
- **O2 — Développer une plateforme web complète** offrant une interface utilisateur moderne, responsive et accessible.
- **O3 — Implémenter un moteur de calcul de pension** capable de simuler le montant futur d'une retraite selon différents scénarios (âge de départ, salaire, rachat de points).
- **O4 — Digitaliser le workflow de liquidation** depuis le dépôt de la demande jusqu'au paiement effectif, avec gestion documentaire électronique.
- **O5 — Assurer la sécurité et la conformité** : authentification JWT, chiffrement des données sensibles, journal d'audit immuable.
- **O6 — Mettre en place une communication asynchrone** entre services via **Apache Kafka** pour garantir la résilience et la scalabilité.
- **O7 — Conteneuriser l'ensemble** de la solution via **Docker** pour faciliter le déploiement et la portabilité.

## 1.5 Portée et limites du projet

### Périmètre inclus
- Modules : Authentification, Affiliation, Cotisations, Simulation, Liquidation, Paiement, Réversion, Audit, Notifications.
- Profils utilisateurs : Affilié, Agent, Administrateur.
- Déploiement local en environnement Docker.

### Périmètre exclu
- Application mobile native (la plateforme est responsive mais pas packagée en application native).
- Intégration réelle avec les systèmes CNSS, bancaires, ou fiscaux (simulée pour les besoins du projet).
- Module de relation client avancé (chatbot, centre d'appel).
- Déploiement en production cloud (Kubernetes, EKS) — l'environnement cible est Docker Compose.

## 1.6 Méthodologie de travail

Pour mener à bien ce projet, j'ai adopté une **méthodologie agile itérative** inspirée de **Scrum**, adaptée à un projet individuel :

- **Découpage en itérations courtes** (sprints d'une semaine) avec des objectifs précis ;
- **Backlog produit** maintenu et priorisé selon la valeur métier ;
- **Daily personnel** sous forme de journal de bord pour suivre l'avancement ;
- **Revue de sprint** hebdomadaire avec l'encadrant ;
- **Rétrospective** régulière pour ajuster la méthode de travail.

### Outils utilisés pour la gestion du projet

| Outil | Usage |
|---|---|
| **Git / GitHub** | Gestion de version, traçabilité des modifications |
| **VS Code** | Éditeur principal frontend |
| **IntelliJ IDEA** | IDE backend Java |
| **Postman** | Tests d'API REST |
| **Docker Desktop** | Conteneurisation et orchestration locale |
| **dbeaver** | Administration PostgreSQL |
| **Draw.io** | Diagrammes UML et architecture |

## 1.7 Structure du document

Le présent rapport est structuré comme suit :

- **Chapitre 1 :** présente le contexte et la problématique.
- **Chapitre 2 :** explore l'état de l'art des solutions et technologies.
- **Chapitre 3 :** détaille l'analyse des besoins et la conception.
- **Chapitre 4 :** justifie les choix technologiques.
- **Chapitre 5 :** décrit l'implémentation des fonctionnalités.
- **Chapitre 6 :** présente la démarche de tests et validation.
- **Chapitre 7 :** explique l'architecture de déploiement.
- **Chapitre 8 :** propose un guide utilisateur.
- La **conclusion** synthétise les acquis et ouvre des perspectives.

## 1.8 Conclusion

Ce chapitre a permis de poser le cadre du projet : un système d'information complet pour la gestion des retraites, répondant à une problématique métier réelle au Maroc. Les objectifs ont été clairement définis, la portée délimitée, et la méthodologie retenue. Le chapitre suivant explore l'état de l'art technologique et fonctionnel pour justifier les choix qui seront opérés.

---

# Chapitre 2 : État de l'art

## 2.1 Introduction

Ce chapitre dresse un panorama des solutions et technologies existantes dans le domaine des systèmes d'information dédiés à la retraite et, plus largement, des plateformes web full-stack modernes. Il compare les principales options et justifie les choix retenus pour ce projet.

## 2.2 Solutions existantes dans le domaine de la retraite

### 2.2.1 Solutions internationales

- **Mercer Workplace Solutions** : plateforme globale de gestion des fonds de pension, propriétaire, déployée principalement en Amérique du Nord et en Europe.
- **WTW Retirement Software** : suite logicielle actuarielle et opérationnelle, ciblée grandes entreprises.
- **SAP SuccessFactors** : module RH intégrant la gestion des avantages sociaux dont la retraite.

Ces solutions sont puissantes mais **coûteuses**, **propriétaires** et **peu adaptées aux spécificités réglementaires marocaines**.

### 2.2.2 Solutions au Maroc

Au Maroc, les caisses de retraite (CIMR, CMR, RCAR, CNSS) utilisent essentiellement des **solutions internes développées sur mesure**, souvent issues d'une histoire informatique longue (mainframe IBM, AS/400, applications COBOL ou Java EE). Quelques portails web existent mais offrent des fonctionnalités limitées (consultation du compte, téléchargement d'attestations).

**Constat** : il n'existe pas, à ma connaissance, de plateforme open-source moderne couvrant l'ensemble du cycle de vie d'un dossier de retraite dans le contexte marocain. Ce projet apporte donc une contribution originale.

## 2.3 Architectures logicielles : monolithique vs microservices

### Tableau 1 : Comparatif des architectures

| Critère | Monolithique | Microservices |
|---|---|---|
| **Complexité initiale** | Faible | Élevée |
| **Déploiement** | Une seule unité | Indépendant par service |
| **Scalabilité** | Verticale (limitée) | Horizontale par service |
| **Maintenance long terme** | Difficile (couplage fort) | Plus simple (modules isolés) |
| **Performance interne** | Excellente (appels en mémoire) | Latence réseau |
| **Évolution technologique** | Bloc unique | Stack hétérogène possible |
| **Adaptation à grande équipe** | Faible | Excellente |
| **Coût opérationnel** | Faible | Élevé (orchestration) |

**Choix retenu** : **Architecture microservices**, malgré sa complexité initiale, pour bénéficier de la modularité, de la scalabilité horizontale et de l'isolation des domaines fonctionnels. Ce choix prépare également le système à une évolution future vers un déploiement Kubernetes en production.

## 2.4 Backend : choix du framework

### Tableau 2 : Comparatif Spring Boot vs Node.js vs ASP.NET Core

| Critère | Spring Boot (Java) | Node.js (Express/Nest) | ASP.NET Core (C#) |
|---|---|---|---|
| **Maturité** | Très élevée (depuis 2014) | Élevée | Élevée |
| **Écosystème** | Très riche (Spring Cloud) | Riche (npm) | Riche (NuGet) |
| **Performance** | Très bonne (JVM) | Bonne (I/O non bloquant) | Très bonne |
| **Sécurité native** | Spring Security (référence) | Bibliothèques tierces | Identity Framework |
| **Typage** | Statique (Java) | Dynamique (TypeScript) | Statique (C#) |
| **Communauté** | Massive | Massive | Importante |
| **Adapté à microservices** | Oui (Spring Cloud) | Oui | Oui |
| **Demande sur le marché marocain** | Très forte | Forte | Moyenne |

**Choix retenu** : **Spring Boot 3.2** pour son écosystème Spring Cloud, sa robustesse, sa sécurité éprouvée et sa forte demande sur le marché de l'emploi marocain.

## 2.5 Frontend : choix de la bibliothèque

### Tableau 3 : Comparatif React vs Angular vs Vue

| Critère | React | Angular | Vue |
|---|---|---|---|
| **Type** | Bibliothèque | Framework complet | Framework progressif |
| **Courbe d'apprentissage** | Modérée | Élevée | Faible |
| **Performance** | Excellente | Très bonne | Excellente |
| **Écosystème** | Très riche | Riche (officiel) | Riche |
| **TypeScript** | Excellent support | Natif | Bon support |
| **Tooling** | Vite, Next.js, CRA | Angular CLI | Vite, Nuxt |
| **Demande emploi** | Très élevée | Élevée | Modérée |

**Choix retenu** : **React 19** avec **TypeScript** et **Vite**, pour son écosystème mature, sa performance, sa flexibilité et l'expérience développeur supérieure de Vite (HMR ultra-rapide).

## 2.6 Base de données

**PostgreSQL 15** a été choisie pour les raisons suivantes :

- **Open source** et **gratuite** ;
- **Conformité ACID** stricte, essentielle pour des transactions financières ;
- Support natif du **JSON** (utile pour les champs flexibles comme l'historique d'audit) ;
- **Performances** comparables aux SGBD propriétaires (Oracle, SQL Server) ;
- **Extensibilité** (extensions PostGIS, pg_trgm, etc.) ;
- **Communauté active** et excellente documentation.

Alternatives écartées : MySQL (moins riche fonctionnellement), Oracle (coûteuse, propriétaire), MongoDB (NoSQL, non adapté à des données relationnelles strictes).

## 2.7 Communication asynchrone : Apache Kafka

Pour la communication événementielle entre microservices, plusieurs options existent : RabbitMQ, ActiveMQ, Redis Pub/Sub, Apache Kafka.

**Apache Kafka** a été retenu pour :

- Son **débit élevé** (millions de messages/seconde) ;
- Sa **persistance** des messages (replay possible) ;
- Sa **scalabilité horizontale** native (partitions, consumer groups) ;
- Son **écosystème** (Kafka Connect, Kafka Streams) ;
- Son **adoption massive** dans les systèmes financiers.

## 2.8 Conteneurisation

**Docker** et **Docker Compose** sont les standards de facto pour la conteneurisation. Ils permettent :

- L'**isolation** des environnements ;
- La **reproductibilité** des déploiements ;
- La **portabilité** (dev / test / prod identiques) ;
- L'**orchestration locale** simple via Docker Compose.

Pour la production, **Kubernetes** est l'orchestrateur de référence ; il est cité dans les perspectives d'évolution.

## 2.9 Positionnement de la solution

Notre solution se positionne comme une **plateforme open-source, moderne, modulaire et adaptée au contexte marocain**. Elle se distingue :

- Des solutions propriétaires internationales (Mercer, WTW) par son **coût nul** et son **adaptation locale** ;
- Des systèmes hérités marocains par sa **modernité architecturale** ;
- Des projets académiques classiques par son **ambition fonctionnelle** (9 microservices, 18 pages, workflow complet).

## 2.10 Conclusion

L'analyse de l'état de l'art a permis de justifier les choix structurants du projet : architecture microservices, Spring Boot pour le backend, React pour le frontend, PostgreSQL pour la persistance, Kafka pour l'événementiel, Docker pour le packaging. Le chapitre suivant approfondit l'analyse des besoins et la conception du système.

---

# Chapitre 3 : Analyse et conception

## 3.1 Introduction

Ce chapitre présente l'analyse détaillée des besoins fonctionnels et non fonctionnels du système, ainsi que sa conception architecturale et son modèle de données. Les diagrammes UML clarifient les interactions entre acteurs et composants.

## 3.2 Analyse des besoins

### 3.2.1 Besoins fonctionnels

#### Tableau 4 : Besoins fonctionnels par acteur

| Acteur | Besoin fonctionnel |
|---|---|
| **Affilié** | BF1 : S'authentifier / Réinitialiser son mot de passe |
| | BF2 : Consulter son tableau de bord (points, cotisations, dossiers) |
| | BF3 : Visualiser l'historique de ses cotisations |
| | BF4 : Acheter des points complémentaires |
| | BF5 : Simuler le montant de sa future pension |
| | BF6 : Déposer une demande de liquidation |
| | BF7 : Téléverser des documents justificatifs |
| | BF8 : Consulter ses notifications |
| | BF9 : Mettre à jour son profil |
| **Agent CIMR** | BF10 : Instruire les demandes de liquidation |
| | BF11 : Valider/rejeter les pièces justificatives |
| | BF12 : Programmer les paiements |
| | BF13 : Gérer les pensions de réversion (décès) |
| **Administrateur** | BF14 : Gérer les utilisateurs et les rôles |
| | BF15 : Consulter le journal d'audit |
| | BF16 : Configurer les paramètres système (valeur du point) |
| | BF17 : Superviser l'activité globale |

### 3.2.2 Besoins non fonctionnels

#### Tableau 5 : Besoins non fonctionnels

| Catégorie | Exigence |
|---|---|
| **Performance** | Temps de réponse API < 500 ms en charge nominale |
| **Disponibilité** | 99,5 % en environnement cible |
| **Sécurité** | Authentification JWT, chiffrement TLS, hash bcrypt des mots de passe, chiffrement AES des champs sensibles (CIN) |
| **Conformité** | Loi 09-08 (CNDP), journal d'audit immuable, consentement utilisateur |
| **Scalabilité** | Architecture permettant le scaling horizontal par service |
| **Ergonomie** | Interface responsive, accessibilité WCAG AA |
| **Maintenabilité** | Code typé (TypeScript, Java), couverture de tests > 60 % |
| **Internationalisation** | Interface en français (extensible à l'arabe et l'anglais) |

## 3.3 Diagrammes UML

### 3.3.1 Diagramme de cas d'utilisation général

Le diagramme suivant synthétise les principales interactions entre les acteurs et le système.

```
                         ┌─────────────────────────────────────┐
                         │       SYSTÈME CIMR DIGITAL          │
                         │                                     │
   ┌─────────┐           │  • Authentification                 │
   │ Affilié │───────────│  • Consultation tableau de bord     │
   └─────────┘           │  • Simulation pension               │
        │                │  • Achat de points                  │
        │                │  • Demande de liquidation           │
        │                │  • Téléversement documents          │
        │                │  • Consultation notifications       │
        │                │                                     │
   ┌─────────┐           │  • Instruction des dossiers         │
   │  Agent  │───────────│  • Validation/rejet documents       │
   └─────────┘           │  • Programmation paiements          │
        │                │  • Gestion réversions               │
        │                │                                     │
   ┌─────────┐           │  • Gestion utilisateurs             │
   │  Admin  │───────────│  • Consultation audit logs          │
   └─────────┘           │  • Configuration système            │
                         └─────────────────────────────────────┘
```

### 3.3.2 Diagramme de classes du domaine métier

Les principales entités métier et leurs relations sont :

```
┌──────────┐ 1     *  ┌──────────────┐ 1   *  ┌─────────────┐
│   User   │──────────│   Affilie    │────────│ Contribution │
│──────────│          │──────────────│        │─────────────│
│ id (UUID)│          │ id           │        │ id          │
│ email    │          │ nom, prenom  │        │ periode     │
│ password │          │ cin (crypté) │        │ salaire     │
│ roles    │          │ status       │        │ cotisation  │
│ active   │          │ dateNaiss.   │        │ points      │
└──────────┘          │ salaire      │        └─────────────┘
                      └──────┬───────┘
                             │
                             │ 1
                             │
                       *     ▼
                      ┌─────────────────┐ 1    * ┌──────────────┐
                      │DemandeLiquidation│──────│DossierDocument│
                      │─────────────────│       │──────────────│
                      │ id              │       │ id           │
                      │ affilieId       │       │ typeDocument │
                      │ status          │       │ fileUri      │
                      │ dateDemande     │       │ isVerified   │
                      │ commentaire     │       └──────────────┘
                      └─────────────────┘
                             │ 1
                             │
                             ▼ *
                      ┌─────────────┐  1   * ┌───────────┐
                      │ Allocation  │────────│ Paiement  │
                      │─────────────│        │───────────│
                      │ id          │        │ id        │
                      │ typeAlloc.  │        │ montant   │
                      │ montant     │        │ datePmt   │
                      │ statut      │        │ mode      │
                      └─────────────┘        └───────────┘

           ┌──────────────┐
           │  AyantDroit  │── (lié à Affilié décédé)
           │──────────────│
           │ id           │
           │ lienParente  │
           │ tauxReversion│
           └──────────────┘
```

### 3.3.3 Diagramme de séquence — Connexion utilisateur

```
Utilisateur     Frontend        Gateway        Auth-Service     PostgreSQL
    │              │                │                │                │
    │─Email/Pwd───►│                │                │                │
    │              │─POST /login───►│                │                │
    │              │                │─POST /login───►│                │
    │              │                │                │─SELECT user───►│
    │              │                │                │◄──user data────│
    │              │                │                │                │
    │              │                │                │ bcrypt.verify  │
    │              │                │                │ generate JWT   │
    │              │                │                │                │
    │              │                │◄──{token, user}│                │
    │              │◄──{token, user}│                │                │
    │              │                │                │                │
    │  store token (localStorage)   │                │                │
    │              │                │                │                │
    │◄─Dashboard───│                │                │                │
```

### 3.3.4 Diagramme de séquence — Dépôt d'une demande de liquidation

```
Affilié    Frontend    Gateway   Liquidation-Svc   Kafka    Admin-Svc  Notification
   │          │           │             │            │          │           │
   │─Submit──►│           │             │            │          │           │
   │          │─POST─────►│             │            │          │           │
   │          │           │─POST───────►│            │          │           │
   │          │           │             │ INSERT DB  │          │           │
   │          │           │             │            │          │           │
   │          │           │             │─Event ────►│          │           │
   │          │           │             │ "Liquid.   │          │           │
   │          │           │             │  Created"  │          │          │
   │          │           │◄────────────│            │─consume─►│           │
   │          │◄──────────│             │            │          │ Log audit│
   │◄─Confirm─│           │             │            │          │           │
   │          │           │             │            │          │─notify──►│
   │          │           │             │            │          │           │
   │◄──Email──────────────────────────────────────────────────────────────│
```

## 3.4 Architecture logicielle

### 3.4.1 Vue d'ensemble

L'architecture retenue est une **architecture microservices** comprenant **neuf services backend** orchestrés via un **API Gateway**, avec une **communication synchrone REST** pour les requêtes utilisateur et une **communication asynchrone Kafka** pour les événements métier.

#### Tableau 6 : Liste des microservices

| Service | Port | Responsabilité |
|---|---|---|
| **api-gateway** | 8080 | Point d'entrée unique, routage, CORS |
| **auth-service** | 8079 | Authentification JWT, gestion des utilisateurs |
| **affiliation-service** | 8081 | Gestion des affiliés, adhérents, documents |
| **contribution-service** | 8082 | Cotisations, points, simulation, achat de points |
| **liquidation-service** | 8083 | Demandes de liquidation, documents, workflow |
| **payment-service** | 8084 | Allocations et paiements |
| **reversion-service** | 8085 | Pensions de réversion, ayants droit |
| **admin-service** | 8086 | Audit, notifications, consentement |
| **saga-orchestrator** | 8087 | Orchestration des transactions multi-services |

### 3.4.2 Schéma d'architecture global

```
                          ┌────────────────────────┐
                          │       Frontend         │
                          │  React 19 + TS + Vite  │
                          │      (Port 5173)       │
                          └───────────┬────────────┘
                                      │ HTTPS / JSON
                                      ▼
                          ┌────────────────────────┐
                          │     API Gateway        │
                          │  Spring Cloud Gateway  │
                          │      (Port 8080)       │
                          └─┬──┬──┬──┬──┬──┬──┬──┬─┘
            ┌───────────────┼──┼──┼──┼──┼──┼──┼──┼───────────────┐
            ▼               ▼  ▼  ▼  ▼  ▼  ▼  ▼  ▼               ▼
       ┌────────┐    ┌──────────┐ ┌─────────────┐    ┌──────────────┐
       │  Auth  │    │Affiliation│ │Contribution │    │ Liquidation  │
       │  8079  │    │   8081   │ │    8082     │    │     8083     │
       └────┬───┘    └─────┬────┘ └──────┬──────┘    └──────┬───────┘
            │              │             │                   │
            │              │             │                   │
       ┌────▼───┐    ┌─────▼────┐ ┌──────▼──────┐    ┌──────▼───────┐
       │Payment │    │Reversion │ │   Admin     │    │     Saga     │
       │  8084  │    │  8085    │ │   8086      │    │     8087     │
       └────┬───┘    └─────┬────┘ └──────┬──────┘    └──────┬───────┘
            │              │             │                   │
            └──────┬───────┴─────────────┴───────────────────┘
                   ▼                              │
            ┌─────────────────┐     ┌─────────────▼────────────┐
            │  PostgreSQL 15  │     │     Apache Kafka 7.5     │
            │    (Port 5435)  │     │       (Port 9092)        │
            │  7 databases    │     │  + Zookeeper (Port 2181) │
            └─────────────────┘     └──────────────────────────┘
```

### 3.4.3 Patterns architecturaux mis en œuvre

- **API Gateway Pattern** : point d'entrée unique pour le frontend.
- **Database per Service** : chaque microservice possède son propre schéma PostgreSQL (cimr_auth, cimr_affiliation, cimr_contributions, etc.) — découplage fort.
- **Event-Driven Architecture** : communication asynchrone via Kafka pour les notifications, audits et workflows longs.
- **Saga Pattern** : orchestration des transactions distribuées (ex. : liquidation impliquant plusieurs services).
- **CQRS partiel** : séparation conceptuelle entre les écritures (commandes) et lectures (requêtes) dans certaines APIs.
- **JWT Bearer Authentication** : standard de l'industrie pour les API REST sécurisées.

## 3.5 Modèle de données

### 3.5.1 Schéma logique des bases de données

Le système utilise **sept bases de données PostgreSQL distinctes**, une par microservice fonctionnel :

| Base | Tables principales |
|---|---|
| **cimr_auth** | users, roles, user_roles |
| **cimr_affiliation** | affilies, adherents, bulletin_affiliation, justificatif, radiation, audit_log |
| **cimr_contributions** | contributions, points_ledger, points_purchases, point_values |
| **cimr_liquidation** | demande_liquidation, dossier_document |
| **cimr_payments** | paiements, allocations |
| **cimr_reversion** | ayants_droit |
| **cimr_admin** | audit_logs, notifications, user_consents |

### 3.5.2 Principales entités

**Table `users` (cimr_auth)**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,        -- bcrypt
  cin VARCHAR(255),                       -- chiffré AES
  username VARCHAR(100) UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,              -- ADMIN, AFFILIE, AGENT
  PRIMARY KEY (user_id, role)
);
```

**Table `affilies` (cimr_affiliation)**
```sql
CREATE TABLE affilies (
  id UUID PRIMARY KEY,
  nom VARCHAR(100),
  prenom VARCHAR(100),
  cin VARCHAR(255),                       -- chiffré
  date_naissance DATE,
  salaire_mensuel DECIMAL(15,2),
  status VARCHAR(50),                     -- ACTIVE, RADIE, RETRAITE
  created_at TIMESTAMPTZ
);
```

**Table `demande_liquidation` (cimr_liquidation)**
```sql
CREATE TABLE demande_liquidation (
  id UUID PRIMARY KEY,
  affilie_id VARCHAR(100) NOT NULL,
  affilie_nom VARCHAR(255),
  date_demande TIMESTAMPTZ,
  date_effet_souhaitee DATE,
  status VARCHAR(50),                     -- SUBMITTED → COMPLETED
  commentaire_admin TEXT
);

CREATE TABLE dossier_document (
  id UUID PRIMARY KEY,
  demande_id UUID REFERENCES demande_liquidation(id),
  type_document VARCHAR(100),
  file_uri TEXT,
  is_verified BOOLEAN DEFAULT FALSE
);
```

### 3.5.3 Migration et versionnement des schémas

Toutes les bases de données sont versionnées avec **Flyway 9.22.3**. Chaque microservice porte ses propres scripts de migration sous `src/main/resources/db/migration/V{N}__{description}.sql`, garantissant un déploiement reproductible et traçable.

## 3.6 Conclusion

Ce chapitre a détaillé l'analyse des besoins, la conception UML, l'architecture microservices et le modèle de données. Les choix conceptuels — séparation par domaine, communication mixte synchrone/asynchrone, base de données par service — posent les fondations d'un système robuste et évolutif. Le chapitre suivant approfondit les technologies retenues et leur justification.

---

# Chapitre 4 : Technologies utilisées

## 4.1 Introduction

Ce chapitre présente les technologies, frameworks et bibliothèques utilisés pour la mise en œuvre du projet, en justifiant chaque choix.

## 4.2 Backend

### 4.2.1 Java 17 (LTS)

Java 17 est la version **LTS (Long-Term Support)** de référence, supportée jusqu'en 2029. Elle apporte des fonctionnalités modernes comme les **records**, les **sealed classes** et **pattern matching**, tout en restant compatible avec l'écosystème Spring.

### 4.2.2 Spring Boot 3.2.3

Framework de référence pour les applications Java d'entreprise. Apporte :
- **Auto-configuration** et **convention over configuration** ;
- **Spring Data JPA** pour la couche persistance ;
- **Spring Web MVC** pour les API REST ;
- **Spring Security** pour la sécurité ;
- **Spring Actuator** pour le monitoring (endpoints `/health`, `/metrics`).

### 4.2.3 Spring Cloud 2023.0.0

Suite d'outils pour les architectures distribuées :
- **Spring Cloud Gateway** : API Gateway réactif (utilisé en port 8080) ;
- **Spring Cloud OpenFeign** : client HTTP déclaratif pour appels inter-services ;
- **Spring Cloud Config** : centralisation des configurations (utilisable en évolution future).

### 4.2.4 Spring Security + JJWT 0.12.5

**Spring Security** assure :
- L'**authentification** via filtre JWT personnalisé ;
- L'**autorisation** par annotations `@PreAuthorize("hasRole('ADMIN')")` ;
- La **protection CSRF**, la configuration CORS, le hash **bcrypt** des mots de passe.

**JJWT** est utilisé pour générer et valider les tokens JWT (HMAC-SHA256, durée 24h).

### 4.2.5 Spring Data JPA + Hibernate

Couche d'abstraction ORM :
- **Repositories** par interface (`extends JpaRepository<T, ID>`) ;
- **Query Methods** dérivés du nom (`findByEmailAndIsActive`) ;
- **JPQL** et **Specifications** pour les requêtes complexes ;
- Gestion automatique des transactions via `@Transactional`.

### 4.2.6 PostgreSQL 15

SGBD relationnel, conforme ACID, choisi pour ses performances, son extensibilité et son support enterprise sans coût de licence.

### 4.2.7 Flyway 9.22.3

Outil de **migration de schéma versionné**. Chaque service applique automatiquement ses scripts SQL au démarrage.

### 4.2.8 Apache Kafka 7.5.3

Plateforme de streaming d'événements. Utilisée pour :
- **Notifications** (événements de changement de statut) ;
- **Audit asynchrone** (enregistrement non bloquant) ;
- **Saga** entre services.

### 4.2.9 SpringDoc OpenAPI 2.3.0

Génère automatiquement la documentation **Swagger UI** des API à partir des annotations Java (`@Operation`, `@Schema`). Accessible sur `/swagger-ui.html` de chaque service.

### 4.2.10 Maven 3.9.6

Outil de build et de gestion des dépendances. Multi-module configuré pour chaque microservice.

## 4.3 Frontend

### 4.3.1 React 19.2.4

Bibliothèque UI déclarative, basée sur les composants et le **Virtual DOM**. Version 19 apporte le **Compiler React** (optimisations automatiques) et le support amélioré des **Server Components** (non utilisés ici).

### 4.3.2 TypeScript 5.9

Sur-ensemble typé de JavaScript. Apporte :
- **Sécurité de type** à la compilation ;
- **Refactoring assisté** dans l'IDE ;
- **Documentation vivante** via les interfaces.

### 4.3.3 Vite 8.0.0

Build tool moderne ultra-rapide grâce à **ESBuild** (transpilation) et **Rollup** (build de production). Le HMR (Hot Module Replacement) est quasi instantané.

### 4.3.4 React Router 7.13.1

Routage déclaratif côté client (SPA). Gère la navigation entre les 18 pages, la protection des routes (authentification) et le code splitting.

### 4.3.5 TanStack Query (React Query) 5.90.21

Bibliothèque de gestion du cache et de la synchronisation serveur. Apporte :
- **Cache automatique** des requêtes ;
- **Refetch** intelligent (focus, network, interval) ;
- **Mutations** avec invalidation ciblée.

### 4.3.6 Axios 1.13.6

Client HTTP. Intercepteurs configurés pour :
- L'ajout automatique du **Bearer token** ;
- La gestion des **erreurs 401** (redirect login) ;
- Le **retry** sur certaines erreurs réseau.

### 4.3.7 Zod 4.3.6 + React Hook Form 7.71.2

- **React Hook Form** : gestion performante des formulaires (re-renders minimisés) ;
- **Zod** : validation par schéma TypeScript-first, intégré à RHF via `zodResolver`.

### 4.3.8 Tailwind CSS

Framework CSS **utility-first** : classes utilitaires composables, sans nécessiter d'écrire du CSS personnalisé. Réduit considérablement le bundle CSS final.

### 4.3.9 Lucide React + Framer Motion

- **Lucide React** : bibliothèque d'icônes SVG modernes ;
- **Framer Motion** : animations déclaratives (transitions de pages, micro-interactions).

## 4.4 Infrastructure et DevOps

### 4.4.1 Docker

Conteneurisation : chaque microservice possède son **Dockerfile** multi-stage (build Maven puis runtime JRE optimisé).

### 4.4.2 Docker Compose

Orchestration locale : un seul fichier `docker-compose.yml` lance l'ensemble du système (12 conteneurs : 9 services + PostgreSQL + Kafka + Zookeeper).

### 4.4.3 Git / GitHub

Gestion de version. Stratégie de branches : `main` (production), `develop` (intégration), `feature/*` (développement).

## 4.5 Justification synthétique

Le choix combiné **Spring Boot + React + PostgreSQL + Kafka + Docker** représente la **stack la plus demandée** sur le marché de l'emploi marocain et international en 2025. Toutes les technologies sont **open-source**, **matures**, **bien documentées** et bénéficient d'une **communauté active**. Ce projet constitue donc à la fois une réponse fonctionnelle et un investissement de compétences.

## 4.6 Conclusion

Les technologies retenues forment un **stack moderne, performant et professionnel**, parfaitement adapté aux exigences d'un système d'information de gestion des retraites. Le chapitre suivant détaille leur mise en œuvre concrète.

---

# Chapitre 5 : Implémentation

## 5.1 Introduction

Ce chapitre décrit l'implémentation concrète du projet : environnement de développement, structure du code, fonctionnalités majeures, algorithmes clés et difficultés rencontrées.

## 5.2 Environnement de développement

| Composant | Version |
|---|---|
| **OS de développement** | Windows 11 Pro |
| **JDK** | OpenJDK 17 |
| **IDE Backend** | IntelliJ IDEA Community 2024.1 |
| **Node.js** | 20 LTS |
| **IDE Frontend** | Visual Studio Code |
| **Docker Desktop** | 4.30+ |
| **Git** | 2.40+ |
| **PostgreSQL Client** | dbeaver 24.0 |
| **Tests API** | Postman 11 |

## 5.3 Structure du code

### 5.3.1 Organisation du dépôt Git

```
projet-fin-d-etude-main/
├── backend/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── affiliation-service/
│   ├── contribution-service/
│   ├── liquidation-service/
│   ├── payment-service/
│   ├── reversion-service/
│   ├── admin-service/
│   ├── saga-orchestrator/
│   └── docker-compose.yml
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/             # Clients HTTP (axios)
│   │   ├── components/      # Composants réutilisables
│   │   ├── hooks/           # Hooks React personnalisés
│   │   ├── pages/           # Pages de l'application
│   │   ├── routes/          # Configuration du routeur
│   │   ├── store/           # État global (Context API)
│   │   ├── types/           # Définitions TypeScript
│   │   ├── utils/           # Fonctions utilitaires
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── diagrams/                # Diagrammes UML
├── scripts/                 # Scripts utilitaires
└── README.md
```

### 5.3.2 Structure d'un microservice (exemple : liquidation-service)

```
liquidation-service/
├── src/
│   ├── main/
│   │   ├── java/ma/cimr/liquidation/
│   │   │   ├── LiquidationApplication.java     # Entrée principale
│   │   │   ├── config/                         # Configurations Spring
│   │   │   ├── controller/                     # Contrôleurs REST
│   │   │   ├── service/                        # Logique métier
│   │   │   ├── repository/                     # Accès données JPA
│   │   │   ├── model/                          # Entités JPA
│   │   │   ├── dto/                            # Data Transfer Objects
│   │   │   ├── mapper/                         # Conversion entity↔DTO
│   │   │   ├── exception/                      # Exceptions personnalisées
│   │   │   ├── event/                          # Événements Kafka
│   │   │   └── security/                       # Filtres JWT, etc.
│   │   └── resources/
│   │       ├── application.yml
│   │       └── db/migration/V1__init.sql
│   └── test/
└── pom.xml
```

### 5.3.3 Structure d'une page React

```typescript
// frontend/src/pages/liquidations/LiquidationListPage.tsx
export default function LiquidationListPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['liquidations'],
    queryFn: () => liquidationApi.getAll(),
  });

  if (isLoading) return <Spinner />;

  return (
    <Layout>
      <Header title="Mes demandes de liquidation" />
      <Table data={data} columns={columns} />
    </Layout>
  );
}
```

## 5.4 Fonctionnalités implémentées

### 5.4.1 Module Authentification

**Composants :**
- Page de connexion (`LoginPage`)
- Page de réinitialisation de mot de passe (`ResetPasswordPage`)
- Intercepteur Axios injectant le Bearer token
- Hook `useAuth()` exposant `user`, `login`, `logout`

**Algorithme JWT (côté backend) :**
```java
public String generateToken(User user) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("roles", user.getRoles());
    claims.put("userId", user.getId().toString());
    return Jwts.builder()
        .claims(claims)
        .subject(user.getEmail())
        .issuedAt(new Date())
        .expiration(new Date(System.currentTimeMillis() + 86400000))
        .signWith(secretKey, SIG.HS256)
        .compact();
}
```

### 5.4.2 Module Simulation de pension

**Page :** `PensionSimulationPage` — formulaire multi-étapes (3 steps).

**Algorithme de calcul (simplifié) :**

```
1. Calcul des points cumulés :
   Points = Σ (Cotisation_mensuelle_i / ValeurAchat_i) pour tous les mois cotisés

2. Projection jusqu'à la retraite :
   PointsFuturs = Points × (1 + revalorisation_annuelle)^années_restantes

3. Calcul de la pension brute :
   PensionAnnuelle = PointsTotal × ValeurService_année_retraite

4. Calcul de la pension nette :
   PensionNette = PensionBrute × (1 - taux_prélèvement_social - taux_IR)
```

**Validation côté frontend (Zod) :**
```typescript
const simulationSchema = z.object({
  ageDepart: z.number().min(55).max(70),
  salaireMensuel: z.number().positive(),
  anneesCotisation: z.number().min(0).max(45),
  rachatPoints: z.boolean().optional(),
});
```

### 5.4.3 Module Liquidation

Workflow complet implémenté :

| État | Description | Acteur déclencheur |
|---|---|---|
| **DEPOSE** (SUBMITTED) | Demande créée par l'affilié | Affilié |
| **ATTENTE_DOCS** | Pièces complémentaires requises | Agent |
| **EN_COURS** (UNDER_REVIEW) | Instruction en cours | Agent |
| **VALIDE** | Dossier accepté | Agent |
| **REJETE** | Dossier refusé (motif obligatoire) | Agent |
| **LIQUIDE** (COMPLETED) | Premier paiement effectué | Système |

**Téléversement de documents :**
```typescript
uploadDocument: async (id: string, file: File, type: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  return apiClient.post(`/api/liquidations/${id}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}
```

### 5.4.4 Module Cotisations & Points

- **Déclaration mensuelle** : interface de saisie/import CSV.
- **Conversion en points** : automatique selon `point_value` de l'année.
- **Achat de points complémentaires** : page `PointsPurchasePage` avec calcul instantané du coût.
- **Upsert intelligent** des valeurs de point (gestion contrainte unique année) :

```java
public PointValue savePointValue(PointValue pointValue) {
    return pointValueRepository.findByYear(pointValue.getYear())
        .map(existing -> {
            existing.setValue(pointValue.getValue());
            return pointValueRepository.save(existing);
        })
        .orElseGet(() -> pointValueRepository.save(pointValue));
}
```

### 5.4.5 Module Paiements

- Création d'**allocations** (pension mensuelle, prime, etc.) ;
- Programmation de **paiements** (virement, chèque) avec statuts ;
- Réinitialisation des formulaires sur succès / fermeture du modal.

### 5.4.6 Module Réversion

- Déclaration de décès d'un affilié.
- Saisie des **ayants droit** (conjoint, enfants orphelins).
- Calcul du **taux de réversion** (50 % par défaut pour le conjoint).
- Workflow de validation similaire à la liquidation, avec gestion des **motifs de rejet** obligatoires.

### 5.4.7 Module Audit & Notifications

- Toute action sensible (connexion, modification de statut, accès à des données personnelles) génère un **événement Kafka** consommé par `admin-service`.
- L'audit est consultable via la page `AuditLogPage` (filtres par date, utilisateur, action).
- Les notifications sont distribuées en temps réel (polling React Query toutes les 30s).

### 5.4.8 Module Tableau de bord

Page d'accueil agrégeant pour l'affilié :
- Nombre de points cumulés ;
- Estimation de la pension annuelle ;
- Cotisations versées sur l'année en cours ;
- Statut des demandes en cours ;
- Dernières notifications.

Implémentation : agrégation côté frontend via `Promise.all` sur les différentes API, avec mapping :

```typescript
const affilieMap = new Map<string, string>(
  affilies.map((a) => [a.id, `${a.nom} ${a.prenom}`])
);
// Résolution des noms à partir des IDs
affilieNom: l.affilieNom || affilieMap.get(l.affilieId) || l.affilieId
```

## 5.5 Difficultés rencontrées et solutions adoptées

### 5.5.1 Communication inter-services

**Difficulté** : les premiers tests généraient des erreurs CORS et des chemins incohérents.
**Solution** : centralisation du routage dans l'API Gateway, configuration CORS globale, préfixage uniforme `/api/{service}`.

### 5.5.2 Cohérence des données entre microservices

**Difficulté** : un nom d'affilié dupliqué dans plusieurs bases pouvait diverger.
**Solution** : stockage du `affilie_nom` dénormalisé au moment de la création, complété par un fallback de résolution côté frontend (`Map<id, nom>`).

### 5.5.3 Contrainte d'unicité sur l'année (point_value)

**Difficulté** : erreur HTTP 500 lors d'une seconde saisie d'une valeur de point pour la même année.
**Solution** : implémentation d'un **upsert** dans le service backend (cf. section 5.4.4).

### 5.5.4 Réinitialisation des formulaires modaux

**Difficulté** : à la réouverture d'un modal, les anciennes valeurs persistaient.
**Solution** : ajout de fonctions `resetForm()` appelées sur succès, fermeture, et clic sur l'overlay.

### 5.5.5 Synchronisation Docker / réseau

**Difficulté** : noms de conteneurs et de réseaux préfixés par Docker Compose (`projet-fin-d-etude-main_cimr-network`).
**Solution** : usage cohérent du nom de réseau exact dans toutes les commandes ; centralisation des credentials dans `docker-compose.yml`.

## 5.6 Conclusion

L'implémentation a permis de concrétiser l'ensemble des modules conçus dans le chapitre précédent. Le code est structuré, typé, testable et déployable via Docker. Les difficultés rencontrées ont été surmontées par des solutions techniques pragmatiques. Le chapitre suivant présente la démarche de tests et de validation.

---

# Chapitre 6 : Tests et Validation

## 6.1 Introduction

La qualité d'un logiciel se mesure autant à sa capacité à fonctionner qu'à sa capacité à **résister aux modifications et aux erreurs**. Ce chapitre présente la stratégie de tests mise en œuvre pour garantir la fiabilité du système.

## 6.2 Stratégie de test

La stratégie suit la **pyramide des tests** classique :

```
              ┌──────────────┐
              │  Tests E2E   │   (peu nombreux, coûteux)
              ├──────────────┤
              │  Tests d'    │
              │ intégration  │   (nombre modéré)
              ├──────────────┤
              │ Tests unit.  │   (très nombreux, rapides)
              └──────────────┘
```

### Tableau 7 : Plan de tests

| Niveau | Outils | Couverture cible |
|---|---|---|
| **Tests unitaires backend** | JUnit 5, Mockito | > 70 % |
| **Tests unitaires frontend** | Vitest, React Testing Library | > 60 % |
| **Tests d'intégration backend** | Spring Boot Test, Testcontainers | scénarios principaux |
| **Tests d'API** | Postman, collections automatisées | toutes les routes |
| **Tests E2E** | Playwright (manuel) | parcours critiques |

## 6.3 Tests unitaires backend

Exemple de test d'un service métier :

```java
@ExtendWith(MockitoExtension.class)
class PointValueServiceTest {

    @Mock private PointValueRepository repository;
    @InjectMocks private PointValueService service;

    @Test
    void shouldUpdateExistingPointValueForYear() {
        PointValue existing = new PointValue(2025, BigDecimal.valueOf(15.0));
        when(repository.findByYear(2025)).thenReturn(Optional.of(existing));
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));

        PointValue input = new PointValue(2025, BigDecimal.valueOf(16.0));
        PointValue result = service.savePointValue(input);

        assertEquals(BigDecimal.valueOf(16.0), result.getValue());
        verify(repository).save(existing);
    }
}
```

## 6.4 Tests d'intégration

Avec **Testcontainers**, on lance une vraie instance PostgreSQL le temps du test :

```java
@SpringBootTest
@Testcontainers
class LiquidationRepositoryIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15");

    @DynamicPropertySource
    static void registerProps(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", postgres::getJdbcUrl);
        r.add("spring.datasource.username", postgres::getUsername);
        r.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private DemandeLiquidationRepository repository;

    @Test
    void shouldFindByAffilieId() {
        var demande = new DemandeLiquidation();
        demande.setAffilieId("AFF-001");
        repository.save(demande);

        var result = repository.findByAffilieId("AFF-001");
        assertEquals(1, result.size());
    }
}
```

## 6.5 Tests d'API (Postman)

Une **collection Postman** couvre les endpoints critiques :
- Authentification (POST `/api/auth/login`)
- CRUD affiliés (`/api/affilies`)
- Cycle de liquidation (création, upload doc, changement de statut)

Variables d'environnement (`{{baseUrl}}`, `{{token}}`) permettent de basculer entre environnements (local, Docker, distant).

## 6.6 Tests utilisateurs

Une session de **test utilisateur informel** a été menée auprès de 5 personnes (étudiants, encadrant, proches). Les scénarios testés :

1. Connexion et accès au tableau de bord ;
2. Simulation d'une pension ;
3. Dépôt d'une demande de liquidation avec téléversement de pièces ;
4. Consultation des notifications.

**Retours principaux** :
- ✅ Interface jugée **claire et moderne** ;
- ✅ Le simulateur de pension est **apprécié** (le plus engageant) ;
- ⚠️ Souhait de **plus d'icônes explicatives** sur certains champs ;
- ⚠️ Demande de **tutoriel d'accueil** pour les premiers utilisateurs.

Les remontées les plus simples ont été intégrées dans la dernière itération.

## 6.7 Résultats et améliorations

| Indicateur | Valeur |
|---|---|
| Tests unitaires backend exécutés | ~120 |
| Tests unitaires frontend exécutés | ~45 |
| Couverture moyenne backend | 65 % |
| Bugs détectés et corrigés | 28 |
| Bugs critiques résolus | 100 % |

Les principales améliorations apportées suite aux tests :
- Correction des **resets de formulaires** modaux ;
- Renforcement de la **validation côté frontend** (Zod) ;
- Ajout de **messages d'erreur explicites** pour les utilisateurs ;
- Implémentation de l'**upsert** sur les valeurs de point.

## 6.8 Conclusion

La démarche de tests, bien que perfectible, a permis d'atteindre un **niveau de qualité satisfaisant** pour un projet académique : couverture honorable, scénarios critiques validés, retours utilisateurs intégrés. Les **perspectives** incluent une augmentation de la couverture, des tests de performance (JMeter) et l'automatisation E2E en CI/CD.

---

# Chapitre 7 : Déploiement

## 7.1 Introduction

Ce chapitre décrit l'architecture de déploiement, les procédures d'installation, la configuration requise, ainsi que les pratiques de maintenance.

## 7.2 Architecture de déploiement

Le déploiement repose sur **Docker Compose**, qui orchestre **12 conteneurs** sur une machine hôte. Un fichier `docker-compose.yml` unique décrit l'ensemble.

```
┌─────────────────────────────────────────────────────────────┐
│                     Machine hôte (Docker Host)              │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Frontend │  │ Gateway  │  │   Auth   │  │Affiliation│    │
│  │  Vite    │  │  8080    │  │  8079    │  │  8081    │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │             │              │              │         │
│  ┌────▼────┐  ┌────▼─────┐  ┌────▼─────┐  ┌────▼─────┐    │
│  │Contrib. │  │Liquidat. │  │ Payment  │  │Reversion │    │
│  │  8082   │  │  8083    │  │  8084    │  │  8085    │    │
│  └────┬────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │            │              │              │         │
│  ┌────▼────┐  ┌────▼─────┐  ┌────▼─────────┐    │         │
│  │ Admin   │  │  Saga    │  │  PostgreSQL  │             │
│  │ 8086    │  │  8087    │  │    5435      │             │
│  └─────────┘  └──────────┘  └──────────────┘             │
│                                                            │
│  ┌──────────────────┐    ┌──────────────────┐             │
│  │ Apache Kafka     │◄──►│   Zookeeper      │             │
│  │   9092 / 29092   │    │      2181        │             │
│  └──────────────────┘    └──────────────────┘             │
│                                                            │
│         Réseau Docker : cimr-network (bridge)              │
└────────────────────────────────────────────────────────────┘
```

## 7.3 Configuration requise

### Matériel minimum recommandé

| Ressource | Minimum | Recommandé |
|---|---|---|
| **CPU** | 4 cœurs | 8 cœurs |
| **RAM** | 8 GB | 16 GB |
| **Disque** | 20 GB SSD | 50 GB SSD |
| **OS** | Windows 10/11, Linux, macOS | — |

### Logiciels prérequis

- **Docker Desktop** 4.30+ (Windows/Mac) ou **Docker Engine** 24+ (Linux)
- **Docker Compose** v2 (intégré à Docker Desktop)
- **Git** 2.40+
- **Node.js** 20 LTS (uniquement pour le frontend en mode développement)

## 7.4 Procédure d'installation

### Étape 1 — Clonage du dépôt

```bash
git clone https://github.com/marwane3214/projet-fin-d-etude.git
cd projet-fin-d-etude-main
```

### Étape 2 — Construction des images Docker (première fois)

```bash
cd backend
docker compose build
```

(Compilation Maven et création des images, environ 10 minutes au premier lancement.)

### Étape 3 — Démarrage de l'ensemble du système

```bash
docker compose up -d
```

Vérification de l'état :
```bash
docker compose ps
```

Les 12 services doivent apparaître en `Up` / `healthy`.

### Étape 4 — Démarrage du frontend

```bash
cd ../frontend
npm install
npm run dev
```

L'interface est accessible sur **http://localhost:5173**.

### Étape 5 — Compte de test

| Email | Mot de passe | Rôle |
|---|---|---|
| `admin@cimr.ma` | `Admin@2025` | ADMIN |
| `agent@cimr.ma` | `Agent@2025` | AGENT |
| `affilie@cimr.ma` | `Affilie@2025` | AFFILIE |

## 7.5 Variables d'environnement

Chaque microservice est configurable via des variables d'environnement, déclarées dans `docker-compose.yml` :

```yaml
auth-service:
  environment:
    SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/cimr_auth
    SPRING_DATASOURCE_USERNAME: cimr
    SPRING_DATASOURCE_PASSWORD: cimr_secret_2024
    SPRING_KAFKA_BOOTSTRAP_SERVERS: kafka:29092
    JWT_SECRET: ${JWT_SECRET:-defaultSecretChangeMeInProd}
    JWT_EXPIRATION_MS: 86400000
```

Les **secrets de production** (JWT, mots de passe DB) sont à fournir via un fichier `.env` non versionné, ou via un gestionnaire de secrets (Vault, AWS Secrets Manager) en déploiement cloud.

## 7.6 Maintenance et mises à jour

### Sauvegardes
- **Base de données** : `pg_dump` quotidien planifié.
- **Documents uploadés** : volume Docker monté sur disque hôte, synchronisé vers stockage objet.

### Mises à jour
- Stratégie **rolling update** : redémarrage service par service via `docker compose up -d --no-deps <service>`.
- Migration de schéma assurée par **Flyway** au démarrage.

### Supervision
- Endpoints Spring Actuator : `/actuator/health`, `/actuator/metrics`.
- Recommandations : ajout futur de **Prometheus + Grafana** pour monitoring temps réel.

## 7.7 Conclusion

Le déploiement via Docker Compose offre une solution **simple, reproductible et portable**. Pour un passage en production, une migration vers **Kubernetes** (EKS, AKS, ou GKE) est recommandée. Le chapitre suivant propose un guide utilisateur des principales fonctionnalités.

---

# Chapitre 8 : Guide Utilisateur

## 8.1 Introduction

Ce chapitre présente, pas à pas, l'usage des principales fonctionnalités de la plateforme du point de vue d'un utilisateur final.

## 8.2 Première connexion

1. Ouvrir un navigateur (Chrome, Firefox, Edge) et accéder à **http://localhost:5173**.
2. Sur la page de connexion, saisir l'**adresse e-mail** et le **mot de passe**.
3. Cliquer sur **"Se connecter"**.
4. En cas d'oubli, cliquer sur **"Mot de passe oublié ?"** : un lien de réinitialisation est envoyé par e-mail.

## 8.3 Tableau de bord

À la connexion, le **tableau de bord** affiche :
- Le nombre total de **points cumulés** ;
- Une **estimation de la pension annuelle** ;
- L'**historique récent des cotisations** ;
- Le **statut des demandes en cours** (liquidation, paiements) ;
- Les **dernières notifications**.

Chaque carte est cliquable pour accéder au détail correspondant.

## 8.4 Simuler sa future pension

1. Dans le menu, cliquer sur **"Simulation"**.
2. **Étape 1** : saisir le **salaire mensuel actuel** et l'**âge de départ envisagé** (entre 55 et 70 ans).
3. **Étape 2** : préciser si l'on souhaite **racheter des points** et le montant éventuel.
4. **Étape 3** : visualiser le **résultat** :
   - Pension annuelle brute et nette ;
   - Détail de l'évolution des points ;
   - Comparaison entre plusieurs scénarios.
5. Possibilité d'**exporter le résultat** en PDF.

## 8.5 Déposer une demande de liquidation

1. Menu → **"Liquidations"** → bouton **"Nouvelle demande"**.
2. Remplir le formulaire : **date d'effet souhaitée**, **mode de paiement**, **coordonnées bancaires**.
3. **Téléverser les documents requis** :
   - Copie de la CIN ;
   - RIB ;
   - Certificat de cessation d'activité.
4. Soumettre. Un **numéro de dossier** est attribué.
5. Suivre l'avancement en temps réel sur la page **"Mes dossiers"**.

## 8.6 Consulter ses cotisations

Menu → **"Cotisations"** : liste paginée des cotisations mensuelles, avec :
- Période (mois/année) ;
- Salaire de référence ;
- Montant de la cotisation ;
- Nombre de points crédités.

Possibilité d'**exporter en CSV** ou en **PDF**.

## 8.7 Acheter des points

1. Menu → **"Points complémentaires"**.
2. Sélectionner le **nombre de points** à acheter.
3. Visualiser le **coût total** instantané (calculé selon la valeur d'achat de l'année).
4. Confirmer et procéder au **paiement en ligne** (simulé dans le cadre du projet).

## 8.8 Notifications

Une **cloche** en haut à droite affiche un badge avec le nombre de notifications non lues. Au clic, la liste des notifications s'affiche, avec :
- Type (info, succès, alerte, erreur) ;
- Date ;
- Message ;
- Lien éventuel vers l'élément concerné.

## 8.9 Profil et paramètres

- **Profil** : consultation et mise à jour des informations personnelles, changement de mot de passe.
- **Paramètres** : préférences de notification, langue, accessibilité.

## 8.10 FAQ — Problèmes courants

**Q : Je n'arrive pas à me connecter.**
R : Vérifiez votre adresse e-mail et votre mot de passe. Si le problème persiste, utilisez la fonction « Mot de passe oublié ».

**Q : Mon document refuse de s'uploader.**
R : Vérifiez que le fichier est au format PDF, JPG ou PNG et qu'il fait moins de 10 Mo.

**Q : La simulation affiche des résultats incohérents.**
R : Vérifiez les valeurs saisies (salaire en MAD, années entières). Si le problème persiste, signalez-le à l'administrateur.

**Q : Le tableau de bord est vide.**
R : Si vous venez de vous inscrire, vos données sont en cours de synchronisation. Réessayez dans quelques minutes.

## 8.11 Conclusion

L'interface a été conçue pour être **accessible aux utilisateurs non techniques**. Une iconographie claire, des messages explicites et des parcours linéaires guident l'utilisateur à chaque étape.

---

# Conclusion et Perspectives

## Synthèse du travail réalisé

Ce projet de fin d'année a permis de **concevoir, développer et déployer une plateforme digitale complète de gestion des retraites** inspirée du contexte métier de la CIMR. Le travail accompli couvre l'intégralité du cycle d'un projet logiciel professionnel : analyse des besoins, conception architecturale, développement, tests, déploiement et documentation.

Sur le plan **technique**, le projet a permis la maîtrise pratique d'un **stack moderne et professionnel** : Spring Boot 3, Spring Cloud Gateway, Spring Security (JWT), Apache Kafka, PostgreSQL, Flyway, React 19, TypeScript, Vite, TanStack Query, Tailwind CSS, Docker. Au total, ce sont **9 microservices backend**, **18 pages frontend** et **7 bases de données** qui ont été conçus et intégrés.

Sur le plan **fonctionnel**, la plateforme couvre l'ensemble du parcours d'un affilié : authentification sécurisée, consultation du tableau de bord, suivi des cotisations, simulation prédictive de la pension, achat de points complémentaires, dépôt et instruction de la demande de liquidation, gestion documentaire, suivi des paiements, gestion des pensions de réversion, audit conforme à la **CNDP** et notifications en temps réel.

Sur le plan **méthodologique**, ce projet a renforcé des compétences essentielles : **gestion agile**, **modélisation UML**, **conception d'architectures distribuées**, **sécurité applicative**, **tests automatisés**, **conteneurisation** et **rédaction de documentation technique**.

## Évaluation des objectifs atteints

| Objectif | Statut | Commentaire |
|---|---|---|
| **O1 — Architecture microservices** | ✅ Atteint | 9 services autonomes |
| **O2 — Plateforme web complète** | ✅ Atteint | 18 pages, responsive |
| **O3 — Moteur de simulation** | ✅ Atteint | Multi-scénarios, validation Zod |
| **O4 — Workflow de liquidation** | ✅ Atteint | 6 statuts, gestion documentaire |
| **O5 — Sécurité et conformité** | ✅ Atteint | JWT, chiffrement, audit |
| **O6 — Communication asynchrone** | ✅ Atteint | Kafka pour audit et notifications |
| **O7 — Conteneurisation** | ✅ Atteint | Docker Compose 12 conteneurs |

## Limitations actuelles

Malgré son ambition, le projet présente plusieurs **limitations** assumées :

1. **Pas de déploiement en production cloud** : le déploiement reste local (Docker Compose). Une migration vers Kubernetes serait nécessaire pour un usage réel.
2. **Couverture de tests partielle** (~65 %) : certains scénarios complexes (sagas Kafka, edge cases) restent insuffisamment testés.
3. **Données simulées** : pas d'intégration réelle avec les systèmes externes (CNSS, banques).
4. **Pas d'application mobile native** : l'interface est responsive mais pas packagée pour Android/iOS.
5. **Module de relation client basique** : pas de chatbot, pas d'intégration CRM.
6. **Mono-langue** : interface en français uniquement (arabe et anglais à prévoir).
7. **Pas de moteur de règles dynamique** : les règles de calcul sont codées en dur ; un BRMS (Drools, Camunda DMN) permettrait plus de flexibilité.

## Perspectives d'évolution

### Court terme

- **Augmentation de la couverture de tests** (> 85 %).
- **Internationalisation** (i18n) : ajout de l'arabe et de l'anglais via `react-i18next`.
- **Mode sombre** côté frontend.
- **Optimisation des performances** (lazy loading, code splitting agressif).

### Moyen terme

- **Migration vers Kubernetes** (EKS, AKS) pour un déploiement cloud-native.
- **Mise en place d'un CI/CD** (GitLab CI ou GitHub Actions) avec tests, build et déploiement automatisés.
- **Monitoring** complet : Prometheus, Grafana, ELK Stack, OpenTelemetry.
- **Application mobile native** (React Native ou Flutter).
- **Intégration de la signature électronique** pour les documents officiels.

### Long terme

- **Intelligence artificielle** : modèle de prédiction du risque de fraude, recommandation personnalisée du moment optimal de départ à la retraite.
- **Blockchain** pour la traçabilité immuable des opérations critiques.
- **Interconnexion avec les écosystèmes** : CNSS (vérification des cotisations de base), banques (virements automatiques), administrations fiscales.
- **Chatbot conversationnel** propulsé par un LLM pour assister les affiliés.
- **Open Banking** : prélèvements automatiques, vérification des RIB.

## Mot final

Au-delà de la simple production d'un livrable technique, ce projet a constitué une **véritable expérience de transformation digitale** appliquée à un secteur stratégique pour le Maroc. Il a démontré la capacité d'un étudiant à orchestrer une stack technologique complète, à concevoir une architecture évolutive et à délivrer une solution fonctionnelle de bout en bout.

Les compétences acquises — pensée systémique, rigueur architecturale, maîtrise du cloud-native — constituent un capital précieux pour la suite du parcours professionnel et académique. Ce travail pose les fondations d'une éventuelle évolution en **Projet de Fin d'Études (PFE)** ou en **startup** dans le domaine de la **FinTech** marocaine.

---

# Références

## Ouvrages et articles

1. Newman, S. (2021). **Building Microservices: Designing Fine-Grained Systems** (2nd ed.). O'Reilly Media.
2. Richardson, C. (2018). **Microservices Patterns: With Examples in Java**. Manning Publications.
3. Walls, C. (2022). **Spring in Action** (6th ed.). Manning Publications.
4. Banks, A., & Porcello, E. (2020). **Learning React** (2nd ed.). O'Reilly Media.
5. Kleppmann, M. (2017). **Designing Data-Intensive Applications**. O'Reilly Media.

## Documentations officielles

6. **Spring Boot Documentation** — https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/ (consulté en mai 2025)
7. **Spring Cloud Gateway** — https://docs.spring.io/spring-cloud-gateway/docs/current/reference/html/
8. **React Documentation** — https://react.dev/
9. **TypeScript Handbook** — https://www.typescriptlang.org/docs/
10. **PostgreSQL 15 Documentation** — https://www.postgresql.org/docs/15/
11. **Apache Kafka Documentation** — https://kafka.apache.org/documentation/
12. **Docker Documentation** — https://docs.docker.com/
13. **TanStack Query** — https://tanstack.com/query/latest
14. **Tailwind CSS** — https://tailwindcss.com/docs

## Réglementation et standards

15. **Loi n° 09-08** relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel — Royaume du Maroc.
16. **Commission Nationale de contrôle de la protection des Données à caractère Personnel (CNDP)** — https://www.cndp.ma
17. **RFC 7519** : JSON Web Token (JWT) — IETF.
18. **OWASP Top 10 (2021)** — https://owasp.org/Top10/

## Contexte CIMR

19. **CIMR — Site officiel** — https://www.cimr.ma
20. **Rapport annuel CIMR 2023**.

---

# Annexes

## Annexe A — Diagramme entité-relation simplifié

(Cf. section 3.5 — diagramme textuel des principales entités.)

## Annexe B — Exemple d'endpoint REST documenté

```java
@RestController
@RequestMapping("/api/liquidations")
@Tag(name = "Liquidations", description = "Gestion des demandes de liquidation")
public class LiquidationController {

    @Operation(summary = "Créer une nouvelle demande de liquidation")
    @ApiResponse(responseCode = "201", description = "Demande créée")
    @ApiResponse(responseCode = "400", description = "Données invalides")
    @PostMapping
    public ResponseEntity<DemandeLiquidationDTO> create(
            @Valid @RequestBody CreateLiquidationRequest request) {
        var saved = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDto(saved));
    }
}
```

## Annexe C — Structure du fichier `docker-compose.yml` (extrait)

```yaml
version: '3.9'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: cimr
      POSTGRES_PASSWORD: cimr_secret_2024
      POSTGRES_MULTIPLE_DATABASES: cimr_auth,cimr_affiliation,cimr_contributions,cimr_liquidation,cimr_payments,cimr_reversion,cimr_admin
    ports: ["5435:5432"]
    networks: [cimr-network]

  kafka:
    image: confluentinc/cp-kafka:7.5.3
    ports: ["9092:9092"]
    networks: [cimr-network]
    depends_on: [zookeeper]

  auth-service:
    build:
      context: .
      dockerfile: auth-service/Dockerfile
    ports: ["8079:8079"]
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/cimr_auth
    depends_on: [postgres]
    networks: [cimr-network]

networks:
  cimr-network:
    driver: bridge
```

## Annexe D — Planification (Gantt simplifié)

```
Semaine  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16
Analyse  ███
Conception   ██████
Backend          ████████████████
Frontend            ███████████████████
Intégration                       ██████
Tests                                ███████
Déploiement                              ████
Rapport                                     ███████
```

## Annexe E — Liste des dépendances frontend (extrait `package.json`)

```json
{
  "dependencies": {
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "react-router-dom": "^7.13.1",
    "@tanstack/react-query": "^5.90.21",
    "axios": "^1.13.6",
    "react-hook-form": "^7.71.2",
    "zod": "^4.3.6",
    "framer-motion": "^12.38.0",
    "lucide-react": "^0.460.0",
    "tailwindcss": "^4.0.0"
  },
  "devDependencies": {
    "typescript": "^5.9.0",
    "vite": "^8.0.0",
    "@vitejs/plugin-react": "^4.3.0"
  }
}
```

## Annexe F — Captures d'écran de l'application

*Note : les captures d'écran réelles sont à insérer ici dans la version finale du document. Pages à illustrer :*

- *Figure 11 :* Page de connexion (`LoginPage`)
- *Figure 12 :* Tableau de bord (`DashboardPage`)
- *Figure 13 :* Page de simulation de pension multi-étapes
- *Figure 14 :* Formulaire de liquidation avec téléversement de documents
- *Figure 15 :* Page d'audit logs (vue administrateur)

---

<div align="center">

**— Fin du document —**

*Rapport rédigé par Mharrech Iliass*
*EMSI — Filière 4IIR — Année universitaire 2024–2025*

</div>
