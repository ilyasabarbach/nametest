export type HomeFeedLocale = "en" | "fr" | "es" | "de" | "ar" | "pt";

export type LocalizedText = Record<HomeFeedLocale, string>;

export type HomeFeedLocaleOption = {
  id: HomeFeedLocale;
  label: string;
  nativeLabel: string;
};

export type HomeFeedCardDefinition = {
  id: string;
  testId: string;
  hot: boolean;
  palette: [string, string];
  tag: LocalizedText;
  title: LocalizedText;
};

export type HomeFeedUiCopy = {
  homeLabel: LocalizedText;
  heroTitle: LocalizedText;
  heroBody: LocalizedText;
  hotLabel: LocalizedText;
  popularLabel: LocalizedText;
  composerLabel: LocalizedText;
  selectedLabel: LocalizedText;
  startLabel: LocalizedText;
  languageLabel: LocalizedText;
  lockedLabel: LocalizedText;
};

export const homeFeedLocales: HomeFeedLocaleOption[] = [
  { id: "en", label: "EN", nativeLabel: "English" },
  { id: "fr", label: "FR", nativeLabel: "Francais" },
  { id: "es", label: "ES", nativeLabel: "Espanol" },
  { id: "de", label: "DE", nativeLabel: "Deutsch" },
  { id: "ar", label: "AR", nativeLabel: "العربية" },
  { id: "pt", label: "PT", nativeLabel: "Portugues" }
];

export const homeFeedUiCopy: HomeFeedUiCopy = {
  homeLabel: {
    en: "Story Feed",
    fr: "Flux d'histoires",
    es: "Feed de historias",
    de: "Story-Feed",
    ar: "موجز القصص",
    pt: "Feed de historias"
  },
  heroTitle: {
    en: "Scroll the hottest name readings",
    fr: "Faites defiler les lectures de noms les plus chaudes",
    es: "Desliza las lecturas de nombres mas calientes",
    de: "Scrolle durch die heissesten Namens-Readings",
    ar: "مرر بين قراءات الاسماء الاكثر سخونة",
    pt: "Role as leituras de nomes mais quentes"
  },
  heroBody: {
    en: "Pick a thumbnail, enter two names, and chase the kind of dramatic result people screenshot instantly.",
    fr: "Choisissez une vignette, entrez deux noms et poursuivez un resultat dramatique qu'on capture tout de suite.",
    es: "Elige una miniatura, escribe dos nombres y persigue un resultado dramatico digno de captura.",
    de: "Wahle ein Thumbnail, gib zwei Namen ein und jage ein dramatisches Ergebnis, das man sofort screenshotten will.",
    ar: "اختر بطاقة، اكتب اسمين، وطارد نتيجة درامية تستحق لقطة شاشة فورا.",
    pt: "Escolha uma miniatura, escreva dois nomes e busque um resultado dramatico que pede screenshot."
  },
  hotLabel: {
    en: "Hot",
    fr: "Hot",
    es: "Hot",
    de: "Hot",
    ar: "Hot",
    pt: "Hot"
  },
  popularLabel: {
    en: "Popular threads",
    fr: "Sujets populaires",
    es: "Temas populares",
    de: "Beliebte Themen",
    ar: "الموضوعات الشائعة",
    pt: "Topicos populares"
  },
  composerLabel: {
    en: "Start this reading",
    fr: "Lancer cette lecture",
    es: "Comenzar esta lectura",
    de: "Dieses Reading starten",
    ar: "ابدأ هذه القراءة",
    pt: "Comecar esta leitura"
  },
  selectedLabel: {
    en: "Selected story",
    fr: "Histoire selectionnee",
    es: "Historia seleccionada",
    de: "Gewahlte Story",
    ar: "القصة المختارة",
    pt: "Historia selecionada"
  },
  startLabel: {
    en: "Reveal my result",
    fr: "Reveler mon resultat",
    es: "Revelar mi resultado",
    de: "Mein Ergebnis enthullen",
    ar: "اكشف نتيجتي",
    pt: "Revelar meu resultado"
  },
  languageLabel: {
    en: "Language",
    fr: "Langue",
    es: "Idioma",
    de: "Sprache",
    ar: "اللغة",
    pt: "Idioma"
  },
  lockedLabel: {
    en: "Play more to unlock",
    fr: "Jouez plus pour debloquer",
    es: "Juega mas para desbloquear",
    de: "Spiele mehr zum Freischalten",
    ar: "العب اكثر لفتحها",
    pt: "Jogue mais para desbloquear"
  }
};

export const homeFeedCards: HomeFeedCardDefinition[] = [
  {
    id: "feed-love-letters",
    testId: "love-match",
    hot: true,
    palette: ["#2c174f", "#ff7a59"],
    tag: {
      en: "Romance reading",
      fr: "Lecture romance",
      es: "Lectura romantica",
      de: "Romantik-Reading",
      ar: "قراءة رومانسية",
      pt: "Leitura romantica"
    },
    title: {
      en: "Every letter in your names reveals the chemistry nobody can fake",
      fr: "Chaque lettre de vos noms revele une alchimie impossible a jouer",
      es: "Cada letra de sus nombres revela una quimica imposible de fingir",
      de: "Jeder Buchstabe eurer Namen enthullt eine Chemie, die niemand spielen kann",
      ar: "كل حرف في اسميكما يكشف كيمياء لا يمكن لاحد تزييفها",
      pt: "Cada letra dos seus nomes revela uma quimica impossivel de fingir"
    }
  },
  {
    id: "feed-wedding-sign",
    testId: "wedding-bells",
    hot: true,
    palette: ["#4f1843", "#ffd166"],
    tag: {
      en: "Future signal",
      fr: "Signal du futur",
      es: "Senal del futuro",
      de: "Zukunftssignal",
      ar: "اشارة من المستقبل",
      pt: "Sinal do futuro"
    },
    title: {
      en: "Are these two names giving quiet promise energy or full wedding fireworks?",
      fr: "Ces deux noms donnent-ils une promesse calme ou de vrais feux d'artifice de mariage ?",
      es: "Estos dos nombres dan una promesa tranquila o fuegos artificiales de boda?",
      de: "Geben diese zwei Namen eher leises Versprechen oder volle Hochzeits-Feuerwerke?",
      ar: "هل يعطي هذان الاسمان وعدا هادئا ام العابا نارية كاملة للزفاف؟",
      pt: "Estes dois nomes passam promessa tranquila ou fogos completos de casamento?"
    }
  },
  {
    id: "feed-friend-chaos",
    testId: "friendship-score",
    hot: false,
    palette: ["#10373b", "#57cc99"],
    tag: {
      en: "Friendship test",
      fr: "Test d'amitie",
      es: "Prueba de amistad",
      de: "Freundschaftstest",
      ar: "اختبار صداقة",
      pt: "Teste de amizade"
    },
    title: {
      en: "Touch the card: is your duo built on trust, chaos, or legendary timing?",
      fr: "Touchez la carte : votre duo est-il base sur la confiance, le chaos ou un timing legendaire ?",
      es: "Toca la tarjeta: su duo se basa en confianza, caos o un timing legendario?",
      de: "Tippe auf die Karte: basiert euer Duo auf Vertrauen, Chaos oder legendarem Timing?",
      ar: "المس البطاقة: هل يقوم ثنائكما على الثقة ام الفوضى ام توقيت اسطوري؟",
      pt: "Toque no card: sua dupla vive de confianca, caos ou timing lendario?"
    }
  },
  {
    id: "feed-crush-signal",
    testId: "secret-crush",
    hot: true,
    palette: ["#3d1025", "#f94144"],
    tag: {
      en: "Crush detector",
      fr: "Detecteur de crush",
      es: "Detector de crush",
      de: "Crush-Detektor",
      ar: "كاشف الاعجاب",
      pt: "Detector de crush"
    },
    title: {
      en: "Is your crush energy still hiding or already impossible to ignore?",
      fr: "Votre energie crush se cache-t-elle encore ou est-elle deja impossible a ignorer ?",
      es: "Tu energia de crush sigue escondida o ya es imposible de ignorar?",
      de: "Versteckt sich eure Crush-Energie noch oder ist sie schon unmoglich zu ignorieren?",
      ar: "هل ما زالت طاقة الاعجاب مختبئة ام اصبحت مستحيلة التجاهل؟",
      pt: "Sua energia de crush ainda se esconde ou ja esta impossivel de ignorar?"
    }
  },
  {
    id: "feed-future-path",
    testId: "future-career",
    hot: false,
    palette: ["#21153e", "#ffbe0b"],
    tag: {
      en: "Name future",
      fr: "Futur du nom",
      es: "Futuro del nombre",
      de: "Namenszukunft",
      ar: "مستقبل الاسم",
      pt: "Futuro do nome"
    },
    title: {
      en: "How loudly is your name calling you toward the future you keep imagining?",
      fr: "Avec quelle force votre nom vous appelle-t-il vers le futur que vous imaginez ?",
      es: "Con que fuerza tu nombre te llama hacia el futuro que imaginas?",
      de: "Wie laut ruft dich dein Name in die Zukunft, die du dir immer vorstellst?",
      ar: "الى اي مدى يناديك اسمك نحو المستقبل الذي تتخيله دائما؟",
      pt: "Com que forca seu nome chama voce para o futuro que voce imagina?"
    }
  },
  {
    id: "feed-drama-cinema",
    testId: "drama-meter",
    hot: false,
    palette: ["#161b38", "#ef476f"],
    tag: {
      en: "Drama scan",
      fr: "Scan du drame",
      es: "Escaner de drama",
      de: "Drama-Scan",
      ar: "فحص الدراما",
      pt: "Scanner de drama"
    },
    title: {
      en: "Does this pairing feel safe, stormy, or pure cinema the second it enters a room?",
      fr: "Ce duo semble-t-il calme, orageux ou purement cinema des qu'il entre dans une piece ?",
      es: "Esta pareja se siente segura, tormentosa o puro cine al entrar a una habitacion?",
      de: "Fuhlt sich dieses Pairing sicher, sturmisch oder wie reines Kino an, sobald es den Raum betritt?",
      ar: "هل يبدو هذا الثنائي هادئا ام عاصفا ام سينمائيا تماما منذ اللحظة الاولى؟",
      pt: "Esta dupla parece segura, tempestuosa ou puro cinema assim que entra na sala?"
    }
  },
  {
    id: "feed-aura-rare",
    testId: "star-aura",
    hot: false,
    palette: ["#25173f", "#ff9f1c"],
    tag: {
      en: "Aura reveal",
      fr: "Revelation d'aura",
      es: "Revelacion de aura",
      de: "Aura-Reveal",
      ar: "كشف الهالة",
      pt: "Revelacao de aura"
    },
    title: {
      en: "How rare is the glow your name leaves behind after people meet you?",
      fr: "A quel point l'aura que votre nom laisse derriere lui est-elle rare ?",
      es: "Que tan raro es el brillo que tu nombre deja despues de conocerte?",
      de: "Wie selten ist das Leuchten, das dein Name hinterlasst, nachdem man dich trifft?",
      ar: "ما مدى ندرة الوهج الذي يتركه اسمك بعد ان يتعرف الناس عليك؟",
      pt: "Quao raro e o brilho que seu nome deixa depois que as pessoas te encontram?"
    }
  },
  {
    id: "feed-fame-headline",
    testId: "fame-level",
    hot: true,
    palette: ["#1d3557", "#fb8500"],
    tag: {
      en: "Headline energy",
      fr: "Energie headline",
      es: "Energia de titular",
      de: "Headline-Energie",
      ar: "طاقة العناوين",
      pt: "Energia de manchete"
    },
    title: {
      en: "Would your name combo rise quietly or turn into full headline energy overnight?",
      fr: "Votre duo de noms monterait-il doucement ou deviendrait-il une vraie headline du jour au lendemain ?",
      es: "Tu combinacion de nombres subiria en silencio o se volveria pura energia de titular de un dia para otro?",
      de: "Wurde euer Namensduo leise steigen oder uber Nacht zu voller Headline-Energie werden?",
      ar: "هل سيرتفع مزيج اسميكما بهدوء ام يتحول الى طاقة عناوين كاملة بين ليلة وضحاها؟",
      pt: "Sua combinacao de nomes subiria em silencio ou viraria energia total de manchete da noite para o dia?"
    }
  },
  {
    id: "feed-destiny-headline",
    testId: "destiny-headline",
    hot: true,
    palette: ["#1d3557", "#fb8500"],
    tag: {
      en: "Future headline",
      fr: "Titre du futur",
      es: "Titular del futuro",
      de: "Zukunfts-Headline",
      ar: "عنوان من المستقبل",
      pt: "Manchete do futuro"
    },
    title: {
      en: "If your future had one headline tonight, what would your name make it say?",
      fr: "Si votre futur avait un seul titre ce soir, que lui ferait dire votre nom ?",
      es: "Si tu futuro tuviera un solo titular esta noche, que haria decir tu nombre?",
      de: "Wenn deine Zukunft heute Nacht nur eine Headline hatte, was wurde dein Name daraus machen?",
      ar: "لو كان لمستقبلك عنوان واحد الليلة، فماذا سيجعله اسمك يقول؟",
      pt: "Se seu futuro tivesse uma unica manchete hoje a noite, o que seu nome faria ela dizer?"
    }
  },
  {
    id: "feed-past-life-echo",
    testId: "past-life-echo",
    hot: false,
    palette: ["#25173f", "#c77dff"],
    tag: {
      en: "Past life story",
      fr: "Histoire de vie passee",
      es: "Historia de vida pasada",
      de: "Frueheres-Leben-Story",
      ar: "قصة حياة سابقة",
      pt: "Historia de vida passada"
    },
    title: {
      en: "What kind of past life still echoes every time people say your name?",
      fr: "Quel genre de vie passee resonne encore chaque fois que les gens disent votre nom ?",
      es: "Que tipo de vida pasada sigue resonando cada vez que la gente dice tu nombre?",
      de: "Welche Art frueheres Leben klingt noch nach, jedes Mal wenn Menschen deinen Namen sagen?",
      ar: "أي نوع من الحياة السابقة ما زال صداه يظهر كلما نطق الناس اسمك؟",
      pt: "Que tipo de vida passada ainda ecoa toda vez que as pessoas dizem seu nome?"
    }
  },
  {
    id: "feed-hidden-gift",
    testId: "hidden-gift",
    hot: false,
    palette: ["#161b38", "#ef476f"],
    tag: {
      en: "Gift decoder",
      fr: "Decodeur de don",
      es: "Decodificador de don",
      de: "Talent-Decoder",
      ar: "مفكك الموهبة",
      pt: "Decodificador de dom"
    },
    title: {
      en: "Your name hides a gift people feel before they can explain it",
      fr: "Votre nom cache un don que les gens ressentent avant de pouvoir l'expliquer",
      es: "Tu nombre esconde un don que la gente siente antes de poder explicarlo",
      de: "Dein Name verbirgt ein Talent, das Menschen spueren bevor sie es erklaeren koennen",
      ar: "اسمك يخفي موهبة يشعر بها الناس قبل أن يتمكنوا من شرحها",
      pt: "Seu nome esconde um dom que as pessoas sentem antes mesmo de conseguir explicar"
    }
  }
];
