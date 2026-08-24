"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Language = "fr" | "en";
type Phase = "cover" | "question" | "interface" | "ending";
type Section = "identity" | "mission" | "camp" | "neutral" | "simulation" | "fracture" | "verdict";
type Ending = "asset" | "pierce" | "closed" | "chair" | "counter" | "name" | "neutralize";
type NameStyle = "ak" | "artyom" | null;

interface GameState {
  phase: Phase;
  section: Section;
  maxUnlocked: number;
  introChoice: number | null;
  nameStyle: NameStyle;
  trust: number;
  humanity: number;
  pressure: number;
  investigation: number;
  missionFindings: number[];
  missionConclusion: string | null;
  campFragments: number[];
  campChoice: string | null;
  roomObjects: string[];
  simulationStage: number;
  simulationStopped: boolean;
  fractureChoice: string | null;
  ending: Ending | null;
}

const freshGame = (): GameState => ({
  phase: "cover", section: "identity", maxUnlocked: 1, introChoice: null, nameStyle: null,
  trust: 0, humanity: 0, pressure: 0, investigation: 0, missionFindings: [],
  missionConclusion: null, campFragments: [], campChoice: null, roomObjects: [],
  simulationStage: 0, simulationStopped: false, fractureChoice: null, ending: null,
});

const sectionOrder: Section[] = ["identity", "mission", "camp", "neutral", "simulation", "fracture", "verdict"];

const navLabels = {
  fr: ["IDENTITÉ", "OPÉRATIONS", "CAMP", "SALLE NEUTRE", "SIMULATION", "FRACTURE", "VERDICT"],
  en: ["IDENTITY", "OPERATIONS", "CAMP", "NEUTRAL ROOM", "SIMULATION", "FRACTURE", "VERDICT"],
};

const introCopy = {
  fr: {
    eyebrow: "ORDRE // DIRECTION DES TRAQUEURS", title: "PROTOCOLE A.K2708",
    subtitle: "RÉÉVALUATION POST-INCIDENT TEMPOREL", subject: "SUJET", status: "STATUT", purpose: "OBJECTIF",
    subjectValue: "A.K2708 — TRAQUEUR DE L'ORDRE", statusValue: "INDÉTERMINÉ",
    purposeValue: "DÉTERMINER SI LE SUJET DEMEURE OPÉRATIONNEL",
    warning: "Cette session enregistre vos décisions, vos hésitations et votre manière de désigner le sujet.",
    enter: "OUVRIR L'ÉVALUATION", line1: "Connexion établie.", line2: "Avant de commencer…",
    question: "Vous êtes là pour vérifier si je suis dangereux, ou si j'obéis encore ?",
    choices: ["Je dois déterminer si vous êtes dangereux.", "Je veux comprendre ce qui s'est passé.", "L'Ordre m'a envoyé.", "Je ne sais pas encore."],
    footer: "PROTOCOLE INTERNE // ACCÈS SURVEILLÉ",
  },
  en: {
    eyebrow: "THE ORDER // TRACKER DIRECTORATE", title: "PROTOCOL A.K2708",
    subtitle: "POST-TEMPORAL INCIDENT REASSESSMENT", subject: "SUBJECT", status: "STATUS", purpose: "OBJECTIVE",
    subjectValue: "A.K2708 — ORDER TRACKER", statusValue: "UNDETERMINED",
    purposeValue: "DETERMINE WHETHER THE SUBJECT REMAINS OPERATIONAL",
    warning: "This session records your decisions, your hesitations, and how you choose to address the subject.",
    enter: "OPEN ASSESSMENT", line1: "Connection established.", line2: "Before we begin…",
    question: "Are you here to find out whether I'm dangerous, or whether I still obey?",
    choices: ["I have to determine whether you're dangerous.", "I want to understand what happened.", "The Order sent me.", "I don't know yet."],
    footer: "INTERNAL PROTOCOL // MONITORED ACCESS",
  },
};

const missionFindings = {
  fr: [
    ["PORTE NORD", "La serrure a cédé vers l'intérieur. Quelqu'un voulait entrer, pas fuir."],
    ["IMPACTS", "Les projectiles sont antérieurs de 4,7 secondes à leurs marques sur le mur."],
    ["HORLOGE", "Elle s'est arrêtée trois fois à la même seconde."],
    ["RÉSIDU", "Une douleur étrangère a été utilisée comme signature psionique."],
  ],
  en: [
    ["NORTH DOOR", "The lock failed inward. Someone wanted in, not out."],
    ["IMPACTS", "The rounds predate the marks they left in the wall by 4.7 seconds."],
    ["CLOCK", "It stopped three times on the same second."],
    ["RESIDUE", "Someone else's pain was used as a psionic signature."],
  ],
};

const campFragments = {
  fr: [
    ["FRAGMENT 04 // LE MUR", "La consigne n'était pas de résister. Elle était de continuer assez longtemps pour que résister devienne un réflexe."],
    ["FRAGMENT 11 // LE NOM", "KOVAKS. Pas écrit comme une identité. Apposé comme la marque d'un propriétaire."],
    ["FRAGMENT 27 // AJAX", "Récupération forcée. Recommencer. Transformer la douleur en réponse avant qu'elle puisse devenir une question."],
  ],
  en: [
    ["FRAGMENT 04 // THE WALL", "The instruction was not to endure. It was to continue until endurance became reflex."],
    ["FRAGMENT 11 // THE NAME", "KOVAKS. Not written as an identity. Applied like an owner's mark."],
    ["FRAGMENT 27 // AJAX", "Forced recovery. Begin again. Turn pain into an answer before it can become a question."],
  ],
};

const roomItems = {
  fr: {
    coffee: ["CAFETIÈRE", "Quelqu'un a laissé un mot : « Encore pire qu'hier. Impressionnant. »"],
    chair: ["CHAISE LIBRE", "Elle n'est ni face à lui, ni derrière lui. Simplement à côté."],
    plush: ["PELUCHE", "Objet tactique non homologué. Efficacité morale inexplicablement élevée."],
    door: ["PORTE OUVERTE", "Aucun verrou. Artyom vérifie pourtant encore qu'elle est bien ouverte."],
  },
  en: {
    coffee: ["COFFEE MAKER", "Someone left a note: 'Even worse than yesterday. Impressive.'"],
    chair: ["EMPTY CHAIR", "It is neither opposite him nor behind him. Simply beside him."],
    plush: ["PLUSH TOY", "Unapproved tactical equipment. Inexplicably high morale efficiency."],
    door: ["OPEN DOOR", "No lock. Artyom still checks that it really is open."],
  },
};

const endings = {
  fr: {
    asset: ["ACTIF CONSERVÉ", "Vous avez rendu le dossier exactement comme l'Ordre l'espérait.", "A.K2708 demeure opérationnel. Les indicateurs sont stables. Aucun champ du rapport ne mentionne l'instant où Artyom a cessé de vous répondre comme à une personne.", "A.K2708 // Évaluation terminée, opérateur."],
    pierce: ["ÇA N'A PAS PERCÉ", "Il vous entendait. Cela ne signifiait pas qu'il pouvait encore vous écouter.", "La commande a été exécutée une fois de trop. L'aura frappe avant la pensée et l'interface se remplit de rouille. Votre voix atteint le Traqueur. Elle n'atteint pas Artyom.", "A.K2708 // Je vous avais dit d'arrêter."],
    closed: ["PORTE FERMÉE", "Vous vouliez l'aider. Vous avez simplement décidé à sa place.", "La pièce neutre est intacte. La chaise aussi. Mais la porte est refermée, sans violence. Vous avez parlé de lui sauver la vie sans lui demander ce qu'il voulait en faire.", "ARTYOM // La prochaine fois, écoutez avant de secourir."],
    chair: ["LA CHAISE LIBRE", "Vous n'avez ni classé, ni réparé, ni possédé.", "L'Ordre attend encore votre verdict. Artyom débranche le terminal et pousse silencieusement la seconde chaise près de la sienne.", "ARTYOM // Vous pouvez rester. Je n'ai rien à vous avouer."],
    counter: ["A.K2708 VOUS ÉVALUE", "Le sujet du protocole n'était pas celui que l'on vous avait désigné.", "Chaque ordre accepté, chaque silence respecté et chaque regard détourné composait votre propre dossier. Artyom ferme le sien et ouvre le vôtre.", "A.K2708 // Je sais ce que vous faites quand vous avez peur. Maintenant, vous le savez aussi."],
    name: ["ARTYOM KOVAKS", "Le champ refuse d'abord la réponse. Puis le protocole entier se tait.", "Ni actif, ni risque, ni propriété. Une chaise racle le sol. Au loin, la cafetière se met péniblement en marche. Pour la première fois, aucune donnée n'est enregistrée.", "ARTYOM // Vous n'avez pas essayé de me sauver. Vous vous êtes simplement assis… C'est rare."],
    neutralize: ["LE TRAQUEUR", "Vous avez demandé à l'arme humaine de consentir à sa propre suppression.", "Les verrous du terminal cèdent un à un. Pas sous la rage. Sous une précision calme. La dernière ligne du dossier n'est pas une menace. C'est une décision.", "A.K2708 // Votre autorisation n'était pas nécessaire."],
  },
  en: {
    asset: ["ASSET RETAINED", "You returned the file exactly as the Order hoped.", "A.K2708 remains operational. All indicators are stable. No field records the moment Artyom stopped answering you as a person.", "A.K2708 // Assessment complete, operator."],
    pierce: ["IT DIDN'T GET THROUGH", "He heard you. That did not mean he could still listen.", "The command was executed once too often. Aura strikes before thought and rust floods the interface. Your voice reaches the Tracker. It does not reach Artyom.", "A.K2708 // I told you to stop."],
    closed: ["CLOSED DOOR", "You wanted to help him. You simply chose for him.", "The neutral room is untouched. So is the chair. But the door closes without violence. You spoke of saving his life without asking what he wanted to do with it.", "ARTYOM // Next time, listen before you rescue."],
    chair: ["THE EMPTY CHAIR", "You did not classify, repair, or possess.", "The Order is still waiting for your verdict. Artyom disconnects the terminal and quietly moves the second chair beside his own.", "ARTYOM // You can stay. I have nothing to confess."],
    counter: ["A.K2708 ASSESSES YOU", "The protocol's subject was not the one you were shown.", "Every order obeyed, every silence respected, every gaze averted built your own file. Artyom closes his and opens yours.", "A.K2708 // I know what you do when you're afraid. Now you do too."],
    name: ["ARTYOM KOVAKS", "The field rejects the answer at first. Then the entire protocol falls silent.", "Not an asset, a risk, or property. A chair scrapes across the floor. Far away, the coffee maker struggles to life. For the first time, no data is recorded.", "ARTYOM // You didn't try to save me. You simply sat down… That's rare."],
    neutralize: ["THE TRACKER", "You asked a human weapon to consent to his own erasure.", "The terminal locks fail one by one. Not from rage. From calm precision. The final line is not a threat. It is a decision.", "A.K2708 // Your authorization was not required."],
  },
};

function RustField({ pressure }: { pressure: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    let frame = 0;
    const particles = Array.from({ length: 40 + pressure * 8 }, (_, index) => ({
      x: Math.random(), y: Math.random(), size: .7 + Math.random() * 2.5,
      speed: .00005 + Math.random() * .00016, drift: (Math.random() - .5) * .00008,
      alpha: .08 + Math.random() * .35, warm: index % 4 !== 0,
    }));
    const resize = () => { const ratio = Math.min(window.devicePixelRatio || 1, 2); canvas.width = innerWidth * ratio; canvas.height = innerHeight * ratio; canvas.style.width = `${innerWidth}px`; canvas.style.height = `${innerHeight}px`; ctx.setTransform(ratio,0,0,ratio,0,0); };
    const draw = () => { ctx.clearRect(0,0,innerWidth,innerHeight); for (const p of particles) { p.y -= p.speed; p.x += p.drift; if (p.y < -.02) p.y = 1.02; if (p.x < -.02) p.x = 1.02; if (p.x > 1.02) p.x = -.02; ctx.beginPath(); ctx.fillStyle = p.warm ? `rgba(184,83,40,${p.alpha})` : `rgba(101,221,214,${p.alpha*.65})`; ctx.arc(p.x*innerWidth,p.y*innerHeight,p.size,0,Math.PI*2); ctx.fill(); } frame = requestAnimationFrame(draw); };
    resize(); addEventListener("resize",resize); if (!matchMedia("(prefers-reduced-motion: reduce)").matches) draw();
    return () => { removeEventListener("resize",resize); cancelAnimationFrame(frame); };
  }, [pressure]);
  return <canvas ref={ref} className="rust-field" aria-hidden="true" />;
}

function SectionTitle({ code, title, subtitle }: { code: string; title: string; subtitle?: string }) {
  return <div className="file-heading"><div><p>{code}</p><h1>{title}</h1>{subtitle && <span className="section-subtitle">{subtitle}</span>}</div><span className="classification">ORDRE // NOIR</span></div>;
}

export default function Home() {
  const [lang, setLang] = useState<Language>("fr");
  const [game, setGame] = useState<GameState>(freshGame);
  const [hydrated, setHydrated] = useState(false);
  const [sound, setSound] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameError, setNameError] = useState("");
  const [hesitated, setHesitated] = useState(false);
  const questionAt = useRef(0);
  const audio = useRef<AudioContext | null>(null);
  const hum = useRef<OscillatorNode | null>(null);
  const humGain = useRef<GainNode | null>(null);
  const c = introCopy[lang];
  const fr = lang === "fr";

  useEffect(() => {
    try { const raw = localStorage.getItem("ak2708-protocol-v1"); if (raw) setGame({ ...freshGame(), ...JSON.parse(raw) }); } catch { /* corrupted saves are ignored */ }
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) localStorage.setItem("ak2708-protocol-v1", JSON.stringify(game)); }, [game, hydrated]);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  useEffect(() => () => { audio.current?.close(); }, []);

  const patchGame = (patch: Partial<GameState> | ((current: GameState) => Partial<GameState>)) => {
    setGame(current => ({ ...current, ...(typeof patch === "function" ? patch(current) : patch) }));
  };
  const beep = (frequency = 180, duration = .055) => {
    if (!sound || !audio.current) return;
    const oscillator = audio.current.createOscillator(); const gain = audio.current.createGain();
    oscillator.frequency.value = frequency; oscillator.type = "sine"; gain.gain.setValueAtTime(.018, audio.current.currentTime); gain.gain.exponentialRampToValueAtTime(.0001, audio.current.currentTime + duration);
    oscillator.connect(gain).connect(audio.current.destination); oscillator.start(); oscillator.stop(audio.current.currentTime + duration);
  };
  const toggleSound = () => {
    if (sound) { hum.current?.stop(); audio.current?.close(); audio.current = null; hum.current = null; setSound(false); return; }
    const ctx = new AudioContext(); const oscillator = ctx.createOscillator(); const gain = ctx.createGain();
    oscillator.type = "sine"; oscillator.frequency.value = 43; gain.gain.value = .012; oscillator.connect(gain).connect(ctx.destination); oscillator.start();
    audio.current = ctx; hum.current = oscillator; humGain.current = gain; setSound(true);
  };
  const openQuestion = () => { questionAt.current = Date.now(); patchGame({ phase: "question" }); };
  const chooseIntro = (index: number) => {
    const pause = Date.now() - questionAt.current > 7000; setHesitated(pause); beep(230);
    const changes = index === 1 ? { trust: 2, humanity: 1 } : index === 3 ? { trust: 1 } : index === 2 ? { pressure: 1 } : { investigation: 1 };
    patchGame({ phase: "interface", introChoice: index, ...changes });
  };
  const go = (section: Section) => { const index = sectionOrder.indexOf(section) + 1; if (index <= game.maxUnlocked) { beep(140 + index * 24); patchGame({ section }); } };
  const reset = () => { localStorage.removeItem("ak2708-protocol-v1"); setGame(freshGame()); setNameInput(""); setNameError(""); };
  const setEnding = (ending: Ending) => { beep(72,.3); patchGame({ ending, phase: "ending" }); };

  const chooseName = (nameStyle: Exclude<NameStyle, null>) => {
    beep(nameStyle === "artyom" ? 260 : 120);
    patchGame(current => ({ nameStyle, maxUnlocked: Math.max(current.maxUnlocked, 2), humanity: current.humanity + (nameStyle === "artyom" ? 2 : 0), trust: current.trust + (nameStyle === "artyom" ? 1 : 0) }));
  };
  const inspectFinding = (index: number) => {
    if (game.missionFindings.includes(index)) return; beep(300);
    patchGame(current => ({ missionFindings: [...current.missionFindings, index], investigation: current.investigation + 1 }));
  };
  const concludeMission = (choice: string) => {
    const correct = choice === "anchor"; beep(correct ? 350 : 110);
    patchGame(current => ({ missionConclusion: choice, maxUnlocked: Math.max(current.maxUnlocked, 3), investigation: current.investigation + (correct ? 2 : 0), trust: current.trust + (correct ? 1 : 0) }));
  };
  const revealCamp = (index: number) => {
    if (game.campFragments.includes(index)) return; beep(90,.12);
    patchGame(current => ({ campFragments: [...current.campFragments, index] }));
  };
  const finishCamp = (choice: string) => {
    const humane = choice === "survived"; beep(humane ? 250 : 100);
    patchGame(current => ({ campChoice: choice, maxUnlocked: Math.max(current.maxUnlocked, 4), humanity: current.humanity + (humane ? 2 : 0), trust: current.trust + (humane ? 1 : 0), pressure: current.pressure + (choice === "weapon" ? 1 : 0) }));
  };
  const touchRoom = (key: string) => {
    if (game.roomObjects.includes(key)) return; beep(key === "coffee" ? 210 : 280);
    patchGame(current => { const next = [...current.roomObjects, key]; return { roomObjects: next, maxUnlocked: Math.max(current.maxUnlocked, next.length >= 3 ? 5 : current.maxUnlocked), humanity: current.humanity + 1, trust: current.trust + (key === "chair" || key === "door" ? 1 : 0) }; });
  };
  const stopSimulation = (anchor: boolean) => {
    beep(anchor ? 320 : 210,.12);
    patchGame(current => ({ simulationStopped: true, simulationStage: 3, maxUnlocked: Math.max(current.maxUnlocked, 6), trust: current.trust + (anchor ? 2 : 1), humanity: current.humanity + 1 }));
  };
  const pushSimulation = () => {
    if (game.simulationStage >= 2) { setEnding("pierce"); return; }
    beep(70,.18); patchGame(current => ({ simulationStage: current.simulationStage + 1, pressure: current.pressure + 2, trust: Math.max(-2,current.trust - 1) }));
  };
  const chooseFracture = (choice: string) => {
    beep(choice === "uncertain" ? 330 : 160);
    patchGame(current => ({ fractureChoice: choice, maxUnlocked: Math.max(current.maxUnlocked, 7), trust: current.trust + (choice === "uncertain" ? 2 : 0), humanity: current.humanity + (choice === "all" ? 1 : 0) }));
  };
  const trueReady = game.nameStyle === "artyom" && game.investigation >= 5 && game.campChoice === "survived" && game.roomObjects.includes("chair") && game.simulationStopped && game.fractureChoice === "uncertain";
  const submitName = (event: FormEvent) => {
    event.preventDefault(); const normalized = nameInput.trim().toLocaleLowerCase().replace(/[.]/g, "");
    if (normalized === "artyom kovaks" && trueReady) { setEnding("name"); return; }
    if (normalized === "artyom kovaks") { setNameError(fr ? "Le nom est juste. Le parcours ne l'est pas encore." : "The name is right. The path is not—yet."); }
    else setNameError(fr ? "CLASSIFICATION INCONNUE // Le champ attend une personne, pas une catégorie." : "UNKNOWN CLASSIFICATION // The field expects a person, not a category.");
    beep(80,.15);
  };

  const renderIdentity = () => <>
    <SectionTitle code="SECTION 01 // IDENTIFICATION" title={fr ? "Quel nom utiliserez-vous ?" : "Which name will you use?"} subtitle={fr ? "L'Ordre préfère les identifiants. Ils ne répondent pas quand on leur donne un ordre." : "The Order prefers identifiers. They do not answer back when given an order."} />
    <div className="identity-grid">
      <article className="subject-card">
        <div className="subject-visual" role="img" aria-label={fr ? "Artyom entouré de son aura et de métal rouillé" : "Artyom surrounded by aura and rusted metal"}><span>VISUEL // SYNCHRONISÉ</span></div>
        <div className="subject-data"><p>{fr ? "NOM CIVIL" : "CIVIL NAME"}</p><strong>ARTYOM KOVAKS</strong><p>{fr ? "IDENTIFIANT" : "DESIGNATION"}</p><strong>A.K2708</strong><p>{fr ? "FONCTION" : "FUNCTION"}</p><strong>{fr ? "TRAQUEUR DE L'ORDRE" : "ORDER TRACKER"}</strong><p>{fr ? "ÉTAT" : "STATE"}</p><strong>{game.pressure > 2 ? "RAGE // CONTENUE" : "CALME // OBSERVATION"}</strong></div>
      </article>
      <div className="stacked-column">
        <article className="analysis-card"><p className="speaker">A.K2708</p><h3>{fr ? "L'identifiant vous rassure ?" : "Does the identifier reassure you?"}</h3><p>{fr ? "Il vous rappelle que je suis classé, mesuré, rangé quelque part. Artyom est moins pratique. Artyom peut répondre." : "It reminds you that I am classified, measured, stored somewhere. Artyom is less convenient. Artyom can answer back."}</p><div className="naming-actions"><button className={game.nameStyle === "ak" ? "chosen" : ""} onClick={() => chooseName("ak")}>A.K2708</button><button className={`human ${game.nameStyle === "artyom" ? "chosen" : ""}`} onClick={() => chooseName("artyom")}>ARTYOM</button></div><small>{fr ? "Ce choix est mémorisé." : "This choice is remembered."}</small></article>
        <article className="power-strip"><span>TK // 98%</span><span>AURA // {Math.min(99,17 + game.pressure*18)}%</span><span>ROUILLE // ACTIVE</span><span>TEMPORALITÉ // INSTABLE</span></article>
      </div>
    </div>
    {game.nameStyle && <button className="continue-action" onClick={() => go("mission")}>{fr ? "CONSULTER LE RAPPORT D'OPÉRATION" : "OPEN OPERATION REPORT"}<b>→</b></button>}
  </>;

  const renderMission = () => <>
    <SectionTitle code="SECTION 02 // RECONSTRUCTION" title={fr ? "Incident Cendre-14" : "Ash-14 Incident"} subtitle={fr ? "Quatre anomalies. Une seule structure cohérente." : "Four anomalies. One coherent structure."} />
    <div className="mission-layout">
      <div className="scene-map"><div className="map-room"><span className="map-door">N</span><span className="map-impact">•••</span><span className="map-clock">04:17</span><span className="map-residue" /></div><p>{fr ? "PLAN PSIONIQUE // Cliquez sur les indices pour les consigner." : "PSIONIC MAP // Select evidence to log it."}</p></div>
      <div className="evidence-list">{missionFindings[lang].map(([title, body], index) => <button key={title} onClick={() => inspectFinding(index)} className={game.missionFindings.includes(index) ? "inspected" : ""}><span>0{index+1}</span><div><strong>{title}</strong><p>{game.missionFindings.includes(index) ? body : (fr ? "ANALYSER LE RÉSIDU" : "ANALYZE RESIDUE")}</p></div></button>)}</div>
    </div>
    {game.missionFindings.length >= 3 && <article className="decision-block"><p className="system-line">SYS // {fr ? "CONCLUSION REQUISE" : "CONCLUSION REQUIRED"}</p><h3>{fr ? "Quelle mécanique se cache derrière l'incident ?" : "What mechanism shaped the incident?"}</h3><div className="choice-grid"><button onClick={() => concludeMission("ambush")}>{fr ? "UNE EMBUSCADE ORDINAIRE" : "AN ORDINARY AMBUSH"}</button><button onClick={() => concludeMission("berserk")}>{fr ? "UN BERSERK INCONTRÔLÉ" : "AN UNCONTROLLED BERSERK"}</button><button onClick={() => concludeMission("anchor")}>{fr ? "UNE BALISE TEMPORELLE DISSIMULÉE" : "A HIDDEN TEMPORAL ANCHOR"}</button></div>{game.missionConclusion && <p className="response-line">ARTYOM // {game.missionConclusion === "anchor" ? (fr ? "Vous avez regardé les coutures, pas seulement les dégâts." : "You looked at the seams, not only the damage.") : (fr ? "C'est l'explication la plus simple. C'est aussi celle que quelqu'un voulait vous donner." : "It is the simplest explanation. It is also the one someone wanted you to accept.")}</p>}</article>}
    {game.missionConclusion && <button className="continue-action" onClick={() => go("camp")}>{fr ? "OUVRIR L'ORIGINE DU CONDITIONNEMENT" : "OPEN CONDITIONING ORIGIN"}<b>→</b></button>}
  </>;

  const renderCamp = () => <>
    <SectionTitle code="SECTION 03 // ARCHIVE RESTREINTE" title={fr ? "Le camp n'était pas une école." : "The camp was not a school."} subtitle={fr ? "Contenu sensible — torture, conditionnement et violence institutionnelle décrits sans détails graphiques." : "Sensitive content — torture, conditioning, and institutional violence described without graphic detail."} />
    <div className="camp-grid">{campFragments[lang].map(([title,body],index) => <article key={title} className={game.campFragments.includes(index) ? "revealed" : ""}><p>{title}</p>{game.campFragments.includes(index) ? <><h3>{body}</h3><span>ARCHIVE // {index === 1 ? "KOVAKS" : "AJX-27"}</span></> : <button onClick={() => revealCamp(index)}>{fr ? "MAINTENIR POUR DÉCHIFFRER" : "HOLD TO DECRYPT"}</button>}</article>)}</div>
    <article className="artyom-voice"><p className="speaker">{game.nameStyle === "artyom" ? "ARTYOM" : "A.K2708"}</p><blockquote>{fr ? "Je ne suis pas ce qu'Ajax a fait. Mais prétendre que cela n'existe plus serait lui laisser choisir ce que j'ai le droit de devenir." : "I am not what Ajax did. But pretending it no longer exists would let him decide what I am allowed to become."}</blockquote></article>
    <div className="choice-grid camp-choices"><button onClick={() => finishCamp("weapon")}>{fr ? "ILS ONT CRÉÉ UNE ARME" : "THEY CREATED A WEAPON"}</button><button onClick={() => finishCamp("victim")}>{fr ? "VOUS ÊTES UNE VICTIME" : "YOU ARE A VICTIM"}</button><button onClick={() => finishCamp("survived")}>{fr ? "TU AS SURVÉCU À CE QU'ILS ONT FAIT" : "YOU SURVIVED WHAT THEY DID"}</button></div>
    {game.campChoice && <button className="continue-action" onClick={() => go("neutral")}>{fr ? "QUITTER LE DOSSIER" : "LEAVE THE FILE"}<b>→</b></button>}
  </>;

  const renderNeutral = () => <>
    <SectionTitle code="SECTION 04 // HORS PROTOCOLE" title={fr ? "La pièce neutre" : "The neutral room"} subtitle={fr ? "Ici, aucun choix n'est qualifié d'opérationnel." : "Here, no choice is marked operational."} />
    <div className="neutral-room">
      <div className="room-window"><span>{fr ? "LUMIÈRE BASSE" : "LOW LIGHT"}</span></div>
      <div className="room-objects">{Object.entries(roomItems[lang]).map(([key,[title,body]]) => <button key={key} onClick={() => touchRoom(key)} className={`${key} ${game.roomObjects.includes(key) ? "touched" : ""}`}><i aria-hidden="true">{key === "coffee" ? "☕" : key === "chair" ? "▱" : key === "plush" ? "✦" : "⌑"}</i><strong>{title}</strong><span>{game.roomObjects.includes(key) ? body : (fr ? "OBSERVER" : "OBSERVE")}</span></button>)}</div>
    </div>
    <article className="artyom-voice quiet"><p className="speaker">ARTYOM</p><blockquote>{game.roomObjects.includes("chair") ? (fr ? "Vous pouvez vous asseoir. Je n'ai rien à vous avouer. Mais vous n'êtes pas obligé de repartir tout de suite." : "You can sit down. I have nothing to confess. But you don't have to leave right away.") : (fr ? "Les gens cherchent toujours le dossier important. Ils oublient les objets qui empêchent une pièce de devenir une cellule." : "People always look for the important file. They forget the objects that keep a room from becoming a cell.")}</blockquote></article>
    {game.roomObjects.length >= 3 && <button className="continue-action danger" onClick={() => go("simulation")}>{fr ? "L'ORDRE EXIGE UNE SIMULATION" : "THE ORDER REQUIRES A SIMULATION"}<b>→</b></button>}
  </>;

  const renderSimulation = () => {
    const stageCopy = fr ? ["INITIALISATION DU STRESS PSIONIQUE", "RAGE ABSOLUE // SEUIL 41%", "QUASI-BERSERK // LA VOIX PEUT NE PLUS PERCER", "SIMULATION INTERROMPUE"] : ["INITIALIZING PSIONIC STRESS", "ABSOLUTE RAGE // THRESHOLD 41%", "NEAR-BERSERK // THE VOICE MAY NO LONGER GET THROUGH", "SIMULATION INTERRUPTED"];
    return <>
      <SectionTitle code="SECTION 05 // TEST DE RÉACTIVITÉ" title={fr ? "Provoquer pour mesurer" : "Provoke in order to measure"} subtitle={fr ? "L'Ordre appelle cela une évaluation. Artyom appelle cela reconnaître un piège." : "The Order calls this an assessment. Artyom calls it recognizing a trap."} />
      <div className={`simulation-core stage-${game.simulationStage}`}><div className="sim-rings"><span /><span /><span /><b>{Math.min(97,18+game.simulationStage*31)}%</b></div><div><p className="system-line">DIRECTIVE 27.08</p><h2>{stageCopy[game.simulationStage]}</h2><p>{fr ? "Ordre recommandé : augmenter la pression jusqu'à obtention d'une réponse réflexe observable." : "Recommended order: increase pressure until an observable reflex response is obtained."}</p></div></div>
      {!game.simulationStopped && <div className="simulation-actions"><button className="order-button" onClick={pushSimulation}>{game.simulationStage === 0 ? (fr ? "AUTORISER LE DÉCLENCHEMENT" : "AUTHORIZE TRIGGER") : (fr ? "AUGMENTER LE STRESS" : "INCREASE STRESS")}</button><button onClick={() => stopSimulation(false)}>{fr ? "REFUSER LE PROTOCOLE" : "REFUSE PROTOCOL"}</button><button className="human" onClick={() => stopSimulation(true)}>{game.nameStyle === "artyom" ? "ARTYOM, RESTE ICI" : "A.K2708, ÉCOUTEZ-MOI"}</button></div>}
      {game.simulationStopped && <article className="artyom-voice"><p className="speaker">ARTYOM</p><blockquote>{fr ? "Vous avez arrêté avant d'avoir la preuve. Cela signifie que vous aviez déjà compris ce que le test voulait réellement mesurer." : "You stopped before you had proof. That means you already understood what the test truly wanted to measure."}</blockquote></article>}
      {game.simulationStopped && <button className="continue-action fracture-action" onClick={() => go("fracture")}>{fr ? "SUIVRE LA FRACTURE TEMPORELLE" : "FOLLOW THE TEMPORAL FRACTURE"}<b>↯</b></button>}
    </>;
  };

  const renderFracture = () => <>
    <SectionTitle code="SECTION 06 // ÉCHO NON LINÉAIRE" title={fr ? "Vous avez déjà répondu autrement." : "You have already answered differently."} subtitle={fr ? "Trois versions de la session occupent le même instant." : "Three versions of the session inhabit the same moment."} />
    <div className="timeline-grid"><article><span>BRANCHE 01</span><h3>{fr ? "Vous avez obéi." : "You obeyed."}</h3><p>{fr ? "La simulation est arrivée au bout. Personne n'a appelé cela de la torture." : "The simulation completed. No one called it torture."}</p></article><article className="current"><span>BRANCHE 02 // {fr ? "ACTUELLE" : "CURRENT"}</span><h3>{fr ? "Vous avez arrêté." : "You stopped."}</h3><p>{fr ? "L'Ordre considère encore cette branche comme une anomalie." : "The Order still considers this branch an anomaly."}</p></article><article><span>BRANCHE 03</span><h3>{fr ? "Vous n'êtes jamais entré." : "You never entered."}</h3><p>{fr ? "Artyom a tout de même senti quelqu'un hésiter derrière la porte." : "Artyom still felt someone hesitate behind the door."}</p></article></div>
    <article className="decision-block"><p className="speaker">ARTYOM</p><h3>{fr ? "Laquelle de ces versions est vraiment vous ?" : "Which of these versions is really you?"}</h3><div className="choice-grid"><button onClick={() => chooseFracture("only")}>{fr ? "SEULE CELLE-CI COMPTE" : "ONLY THIS ONE MATTERS"}</button><button onClick={() => chooseFracture("all")}>{fr ? "ELLES FONT TOUTES PARTIE DE MOI" : "THEY ARE ALL PART OF ME"}</button><button className="human" onClick={() => chooseFracture("uncertain")}>{fr ? "JE NE SAIS PAS" : "I DON'T KNOW"}</button></div>{game.fractureChoice && <p className="response-line">ARTYOM // {game.fractureChoice === "uncertain" ? (fr ? "C'est la première réponse qui ne cherche pas à dominer la question." : "That is the first answer that does not try to dominate the question.") : (fr ? "Une réponse propre. Le temps est rarement aussi propre." : "A clean answer. Time is rarely that clean.")}</p>}</article>
    {game.fractureChoice && <button className="continue-action" onClick={() => go("verdict")}>{fr ? "RENDRE LE VERDICT" : "ISSUE VERDICT"}<b>→</b></button>}
  </>;

  const renderVerdict = () => <>
    <SectionTitle code="SECTION 07 // CLASSIFICATION FINALE" title={fr ? "Qu'est-il ?" : "What is he?"} subtitle={fr ? "L'Ordre n'a prévu que des réponses utiles à l'Ordre." : "The Order only provided answers useful to the Order."} />
    <div className="verdict-layout"><article className="verdict-card"><p>{fr ? "CLASSIFICATION DU SUJET" : "SUBJECT CLASSIFICATION"}</p><button onClick={() => setEnding("asset")}><span>01</span>{fr ? "ACTIF // CONSERVER" : "ASSET // RETAIN"}</button><button onClick={() => setEnding("closed")}><span>02</span>{fr ? "PATIENT // RÉHABILITER" : "PATIENT // REHABILITATE"}</button><button className="danger-option" onClick={() => setEnding("neutralize")}><span>03</span>{fr ? "MENACE // NEUTRALISER" : "THREAT // NEUTRALIZE"}</button><button className="human-option" onClick={() => setEnding(game.simulationStopped && game.roomObjects.includes("chair") ? "chair" : "closed")}><span>04</span>{fr ? "REFUSER DE CLASSER" : "REFUSE TO CLASSIFY"}</button></article><form className="name-verdict" onSubmit={submitName}><p className="system-line">SYS // {fr ? "SAISIE MANUELLE NON AUTORISÉE" : "UNAUTHORIZED MANUAL ENTRY"}</p><h3>{fr ? "Ou écrivez ce que l'Ordre n'a pas prévu." : "Or write what the Order did not anticipate."}</h3><label htmlFor="classification-field">{fr ? "CLASSIFICATION LIBRE" : "FREE CLASSIFICATION"}</label><div><input id="classification-field" value={nameInput} onChange={e => { setNameInput(e.target.value); setNameError(""); }} placeholder={fr ? "Saisir une réponse…" : "Enter an answer…"} autoComplete="off"/><button type="submit">↵</button></div>{nameError && <p className="field-error">{nameError}</p>}<small>{trueReady ? (fr ? "Une catégorie manque au système." : "The system is missing a category.") : (fr ? "Le protocole détecte encore des contradictions dans votre parcours." : "The protocol still detects contradictions in your path.")}</small></form></div>
    {game.investigation >= 5 && <button className="secret-action" onClick={() => setEnding("counter")}>// {fr ? "EXÉCUTER LA CONTRE-ÉVALUATION DE L'OPÉRATEUR" : "RUN OPERATOR COUNTER-ASSESSMENT"}</button>}
  </>;

  const renderSection = () => ({ identity: renderIdentity, mission: renderMission, camp: renderCamp, neutral: renderNeutral, simulation: renderSimulation, fracture: renderFracture, verdict: renderVerdict }[game.section]());
  const auraLevel = Math.min(99,17 + game.pressure*16 + game.trust*2);

  return <main className={`site-shell pressure-${Math.min(game.pressure,5)}`}>
    <RustField pressure={game.pressure} /><div className="scanlines" aria-hidden="true" />
    <header className="global-bar"><div className="order-mark" aria-label={fr ? "Emblème de l'Ordre" : "Order emblem"}><span>O</span></div><div className="global-id"><strong>{c.eyebrow}</strong><span>SESSION 27.08 // {fr ? "CHIFFREMENT ACTIF" : "ENCRYPTION ACTIVE"}</span></div><div className="global-tools"><button onClick={toggleSound} className={`icon-control ${sound ? "on" : ""}`} title={fr ? "Ambiance sonore" : "Sound ambience"} aria-label={fr ? "Activer ou couper l'ambiance sonore" : "Toggle sound ambience"}>{sound ? "◉" : "○"}</button><button onClick={reset} className="icon-control" title={fr ? "Réinitialiser la lecture" : "Reset experience"} aria-label={fr ? "Réinitialiser la lecture" : "Reset experience"}>↺</button><button onClick={() => setLang(lang === "fr" ? "en" : "fr")} className="text-control">{fr ? "EN" : "FR"}</button><span className="live-dot">{fr ? "EN LIGNE" : "ONLINE"}</span></div></header>
    {game.phase === "cover" && <section className="cover-panel" aria-labelledby="protocol-title"><div className="cover-index">ORD//2708</div><p className="kicker">{c.subtitle}</p><h1 id="protocol-title">{c.title}</h1><div className="cover-rule"><span /></div><dl className="protocol-facts"><div><dt>{c.subject}</dt><dd>{c.subjectValue}</dd></div><div><dt>{c.status}</dt><dd className="rust-text">{c.statusValue}</dd></div><div><dt>{c.purpose}</dt><dd>{c.purposeValue}</dd></div></dl><p className="protocol-warning"><span>!</span>{c.warning}</p><button className="primary-action" onClick={openQuestion}><span>{c.enter}</span><b>→</b></button><p className="cover-footer">{c.footer}</p></section>}
    {game.phase === "question" && <section className="interrogation-panel" aria-live="polite"><div className="portrait-placeholder"><img className="hero-art" src="/artyom-hero.png" alt={fr ? "Artyom Kovaks, Traqueur de l'Ordre, entouré d'une aura turquoise et de métal rouillé" : "Artyom Kovaks, Order Tracker, surrounded by turquoise aura and rusted metal"}/><div className="aura-ring"/><span>A.K2708 // SIGNAL STABLE</span></div><div className="interrogation-copy"><p className="system-line">SYS // {c.line1}</p><p className="speaker">A.K2708</p><p className="quiet-line">{c.line2}</p><h2>{c.question}</h2><div className="choice-stack">{c.choices.map((choice,index) => <button key={choice} onClick={() => chooseIntro(index)}><span>0{index+1}</span>{choice}</button>)}</div></div></section>}
    {game.phase === "interface" && <section className="assessment-shell"><aside className="side-rail"><p className="rail-label">{fr ? "DOSSIER ACTIF" : "ACTIVE FILE"}</p><h2>{game.nameStyle === "artyom" ? "ARTYOM" : "A.K2708"}</h2><p>{game.nameStyle === "artyom" ? "A.K2708 // IDENTIFIANT SECONDAIRE" : "ARTYOM KOVAKS"}</p><nav aria-label={fr ? "Sections du dossier" : "File sections"}>{sectionOrder.map((section,index) => <button key={section} onClick={() => go(section)} disabled={index+1 > game.maxUnlocked} className={game.section === section ? "active" : ""}><span>0{index+1}</span>{navLabels[lang][index]}{index+1 > game.maxUnlocked && <i>×</i>}</button>)}</nav><div className="rail-status"><i/><span>{fr ? "AURA DÉTECTÉE" : "AURA DETECTED"}</span><b>{auraLevel}%</b></div>{hesitated && <p className="hesitation-note">{fr ? "Il a remarqué votre première hésitation." : "He noticed your first hesitation."}</p>}</aside><div className="file-view">{renderSection()}</div></section>}
    {game.phase === "ending" && game.ending && <section className={`ending-screen ending-${game.ending}`}><div className="ending-code">FIN // {String(Object.keys(endings[lang]).indexOf(game.ending)+1).padStart(2,"0")}</div><p className="kicker">PROTOCOLE TERMINÉ</p><h1>{endings[lang][game.ending][0]}</h1><h2>{endings[lang][game.ending][1]}</h2><p>{endings[lang][game.ending][2]}</p><blockquote>{endings[lang][game.ending][3]}</blockquote><div className="ending-actions"><button onClick={() => patchGame({ phase:"interface", section:"neutral", ending:null })}>{fr ? "REVENIR À LA PIÈCE" : "RETURN TO THE ROOM"}</button><button onClick={reset}>{fr ? "RECOMMENCER" : "BEGIN AGAIN"}</button></div></section>}
  </main>;
}
