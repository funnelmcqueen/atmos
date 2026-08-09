import { deepMergeSimple } from 'payload'
import type { Config } from 'payload'
import { en } from 'payload/i18n/en'

// `@payloadcms/translations` is not a direct dependency and adding one is not
// worth it: `payload` re-exports everything needed. The types come off the
// config itself, so they follow Payload's own unions on upgrade.
type I18nConfig = NonNullable<Config['i18n']>
type LanguageCode = NonNullable<I18nConfig['fallbackLanguage']>
type SupportedLanguagesMap = NonNullable<I18nConfig['supportedLanguages']>
type LanguagePack = NonNullable<SupportedLanguagesMap[LanguageCode]>

/**
 * Albanian for the Payload admin chrome.
 *
 * Payload 3.87 ships 44 language packs and Albanian is not one of them, so the
 * pack is ours. Two things follow from that:
 *
 * 1. `sq` is not in Payload's `AcceptedLanguages` union, so registering it costs
 *    the casts at the bottom of this file. They are safe: the language key is
 *    only ever used as an object lookup — `getRequestLanguage` checks the cookie
 *    and the Accept-Language header against `Object.keys(supportedLanguages)`
 *    and falls back to `fallbackLanguage` when neither matches, and `initI18n`
 *    reads `supportedLanguages[language]`. Nothing validates against the union
 *    at runtime.
 *
 * 2. `dateFNSKey` stays `en-US`. `importDateFNSLocale` has no `sq` branch and
 *    returns `undefined` for an unknown key, which would leave the date picker
 *    without a locale. The cost is English month names inside the picker; the
 *    listing views format their own dates through `src/lib/format.ts`.
 *
 * Only what an agent actually reads is translated. Everything else deep-merges
 * over `en`, so an untranslated key renders English rather than a raw key path.
 * Follow the voice rule in CLAUDE.md: sentence case, plain verbs, and the same
 * word for the same action everywhere.
 */
const overrides = {
  general: {
    all: 'Të gjitha',
    and: 'Dhe',
    ascending: 'Rritës',
    aboutToDelete: 'Je duke fshirë {{label}} <1>{{title}}</1>. Je i sigurt?',
    backToDashboard: 'Kthehu te faqja kryesore',
    cancel: 'Anulo',
    changesNotSaved:
      'Ndryshimet nuk janë ruajtur. Nëse largohesh tani, do t’i humbasësh.',
    clear: 'Pastro',
    clearAll: 'Pastro të gjitha',
    close: 'Mbyll',
    collapse: 'Mblidh',
    collections: 'Koleksionet',
    columns: 'Kolonat',
    confirm: 'Konfirmo',
    confirmDeletion: 'Konfirmo fshirjen',
    copy: 'Kopjo',
    copyField: 'Kopjo fushën',
    copyRow: 'Kopjo rreshtin',
    create: 'Krijo',
    created: 'Krijuar',
    createdAt: 'Krijuar më',
    createNew: 'Krijo të re',
    createNewLabel: 'Krijo {{label}} të re',
    creating: 'Duke krijuar',
    creatingNewLabel: 'Duke krijuar {{label}} të re',
    dashboard: 'Faqja kryesore',
    delete: 'Fshi',
    deletedSuccessfully: 'U fshi me sukses.',
    deleteLabel: 'Fshi {{label}}',
    deleting: 'Duke fshirë…',
    descending: 'Zbritës',
    document: 'Dokument',
    documents: 'Dokumente',
    duplicate: 'Dyfisho',
    edit: 'Ndrysho',
    editing: 'Duke ndryshuar',
    editLabel: 'Ndrysho {{label}}',
    email: 'Email',
    false: 'Jo',
    filter: 'Filtro',
    filters: 'Filtrat',
    goBack: 'Kthehu',
    item: 'Njësi',
    items: 'njësi',
    language: 'Gjuha',
    lastModified: 'Ndryshuar së fundi',
    leaveAnyway: 'Largohu gjithsesi',
    leaveWithoutSaving: 'Largohu pa ruajtur',
    loading: 'Duke ngarkuar',
    moreOptions: 'Më shumë opsione',
    newPassword: 'Fjalëkalimi i ri',
    next: 'Në vijim',
    no: 'Jo',
    none: 'Asnjë',
    noOptions: 'Nuk ka opsione',
    noResults:
      'Nuk u gjet asnjë {{label}}. Ose nuk ekziston ende ndonjë, ose asnjë nuk përputhet me filtrat e mësipërm.',
    notFound: 'Nuk u gjet',
    noValue: 'Pa vlerë',
    of: 'nga',
    open: 'Hap',
    or: 'Ose',
    order: 'Renditja',
    password: 'Fjalëkalimi',
    pasteField: 'Ngjit fushën',
    pasteRow: 'Ngjit rreshtin',
    payloadSettings: 'Cilësimet',
    perPage: 'Për faqe: {{limit}}',
    previous: 'E mëparshme',
    remove: 'Hiq',
    reset: 'Rikthe',
    row: 'Rresht',
    rows: 'Rreshta',
    save: 'Ruaj',
    saveChanges: 'Ruaj ndryshimet',
    saving: 'Duke ruajtur…',
    searchBy: 'Kërko sipas {{label}}',
    selectLabel: 'Zgjidh {{label}}',
    selectValue: 'Zgjidh një vlerë',
    showAllLabel: 'Shfaq të gjitha {{label}}',
    sort: 'Rendit',
    stayOnThisPage: 'Qëndro në këtë faqe',
    submit: 'Dërgo',
    submitting: 'Duke dërguar…',
    success: 'Sukses',
    successfullyCreated: '{{label}} u krijua me sukses.',
    // The label the admin's own language picker shows for this pack.
    thisLanguage: 'Shqip',
    true: 'Po',
    unsavedChanges:
      'Ke ndryshime të paruajtura. Ruaji ose hiqi para se të vazhdosh.',
    untitled: 'Pa titull',
    updatedAt: 'Përditësuar më',
    updatedSuccessfully: 'U përditësua me sukses.',
    uploading: 'Duke ngarkuar',
    user: 'Përdorues',
    users: 'Përdoruesit',
    value: 'Vlera',
    yes: 'Po',
  },

  // The locale switcher and the copy-between-locales tools. Visible on every
  // document because the content collections are localized (docs/07).
  localization: {
    cannotCopySameLocale: 'Nuk kopjohet te e njëjta gjuhë',
    copyFrom: 'Kopjo nga',
    copyFromTo: 'Duke kopjuar nga {{from}} te {{to}}',
    copyTo: 'Kopjo te',
    copyToLocale: 'Kopjo te një gjuhë tjetër',
    localeToPublish: 'Gjuha për publikim',
    selectedLocales: 'Gjuhët e zgjedhura',
    selectLocaleToCopy: 'Zgjidh gjuhën ku do të kopjosh',
    selectLocaleToDuplicate: 'Zgjidh gjuhët për dyfishim',
  },

  authentication: {
    account: 'Llogaria',
    changePassword: 'Ndrysho fjalëkalimin',
    confirmPassword: 'Konfirmo fjalëkalimin',
    forgotPassword: 'Harrova fjalëkalimin',
    forgotPasswordQuestion: 'Harrove fjalëkalimin?',
    logOut: 'Dil',
    logout: 'Dil',
    logoutSuccessful: 'Dole nga llogaria.',
    login: 'Hyr',
    loginUser: 'Hyr në llogari',
    newPassword: 'Fjalëkalimi i ri',
    resetPassword: 'Rivendos fjalëkalimin',
    stayLoggedIn: 'Më mbaj të lidhur',
  },

  fields: {
    addLabel: 'Shto {{label}}',
    addNew: 'Shto të re',
    addNewLabel: 'Shto {{label}} të re',
    chooseFromExisting: 'Zgjidh nga ekzistueset',
    chooseLabel: 'Zgjidh {{label}}',
    collapseAll: 'Mblidh të gjitha',
    latitude: 'Gjerësia gjeografike',
    longitude: 'Gjatësia gjeografike',
    newLabel: '{{label}} e re',
    passwordsDoNotMatch: 'Fjalëkalimet nuk përputhen.',
    removeRelationship: 'Hiq lidhjen',
    removeUpload: 'Hiq skedarin',
    saveChanges: 'Ruaj ndryshimet',
    selectExistingLabel: 'Zgjidh {{label}} ekzistuese',
    showAll: 'Shfaq të gjitha',
    swapUpload: 'Zëvendëso skedarin',
    uploadNewLabel: 'Ngarko {{label}} të re',
  },

  upload: {
    addFile: 'Shto skedar',
    addFiles: 'Shto skedarë',
    bulkUpload: 'Ngarkim në grup',
    crop: 'Prit',
    dragAndDrop: 'Tërhiq dhe lësho një skedar',
    dragAndDropHere: 'ose tërhiq dhe lësho një skedar këtu',
    editImage: 'Ndrysho foton',
    fileName: 'Emri i skedarit',
    fileSize: 'Madhësia',
    filesToUpload: 'Skedarë për ngarkim',
    fileToUpload: 'Skedar për ngarkim',
    focalPoint: 'Pika e fokusit',
    focalPointDescription:
      'Tërhiq pikën e fokusit mbi foton ose ndrysho vlerat më poshtë.',
    height: 'Lartësia',
    lessInfo: 'Më pak të dhëna',
    moreInfo: 'Më shumë të dhëna',
    noFile: 'Pa skedar',
    pasteURL: 'Ngjit një lidhje',
    selectFile: 'Zgjidh një skedar',
    setFocalPoint: 'Vendos pikën e fokusit',
    sizes: 'Përmasat',
    width: 'Gjerësia',
  },

  version: {
    autosave: 'Ruajtje automatike',
    autosavedSuccessfully: 'U ruajt automatikisht.',
    changed: 'E ndryshuar',
    confirmPublish: 'Konfirmo publikimin',
    confirmUnpublish: 'Konfirmo heqjen nga publikimi',
    currentDraft: 'Drafti aktual',
    currentlyPublished: 'Aktualisht e publikuar',
    draft: 'Draft',
    draftSavedSuccessfully: 'Drafti u ruajt.',
    lastSavedAgo: 'Ruajtur {{distance}} më parë',
    previousVersion: 'Versioni i mëparshëm',
    publish: 'Publiko',
    publishChanges: 'Publiko ndryshimet',
    published: 'E publikuar',
    restoreThisVersion: 'Rikthe këtë version',
    saveDraft: 'Ruaj draftin',
    status: 'Statusi',
    unpublish: 'Hiq nga publikimi',
    version: 'Versioni',
    versions: 'Versionet',
  },

  validation: {
    emailAddress: 'Shkruaj një email të vlefshëm.',
    enterNumber: 'Shkruaj një numër të vlefshëm.',
    greaterThanMax: '{{value}} është më e madhe se maksimumi i lejuar {{max}}.',
    invalidInput: 'Kjo fushë ka një vlerë të pavlefshme.',
    invalidSelection: 'Kjo fushë ka një zgjedhje të pavlefshme.',
    latitudeOutOfBounds: 'Gjerësia gjeografike duhet të jetë midis -90 dhe 90.',
    lessThanMin: '{{value}} është më e vogël se minimumi i lejuar {{min}}.',
    limitReached: 'U arrit kufiri: mund të shtohen vetëm {{max}} njësi.',
    longitudeOutOfBounds: 'Gjatësia gjeografike duhet të jetë midis -180 dhe 180.',
    notValidDate: '“{{value}}” nuk është datë e vlefshme.',
    required: 'Kjo fushë është e detyrueshme.',
    requiresAtLeast: 'Kjo fushë kërkon të paktën {{count}} {{label}}.',
    requiresNoMoreThan: 'Kjo fushë pranon jo më shumë se {{count}} {{label}}.',
    requiresTwoNumbers: 'Kjo fushë kërkon dy numra.',
    shorterThanMax: 'Kjo vlerë duhet të jetë më e shkurtër se {{maxLength}} karaktere.',
  },

  error: {
    correctInvalidFields: 'Korrigjo fushat e shënuara.',
    documentNotFound:
      'Dokumenti me ID {{id}} nuk u gjet. Mund të jetë fshirë, ose nuk ke akses në të.',
    emailOrPasswordIncorrect: 'Email-i ose fjalëkalimi nuk është i saktë.',
    followingFieldsInvalid_one: 'Kjo fushë nuk është e plotësuar si duhet:',
    followingFieldsInvalid_other: 'Këto fusha nuk janë plotësuar si duhet:',
    invalidFileType: 'Lloj skedari i papranuar',
    missingRequiredData: 'Mungojnë të dhëna të detyrueshme.',
    noFilesUploaded: 'Nuk u ngarkua asnjë skedar.',
    notAllowedToPerformAction: 'Nuk ke leje për këtë veprim.',
    problemUploadingFile: 'Pati një problem gjatë ngarkimit të skedarit.',
    unauthorized: 'Duhet të jesh i identifikuar për ta bërë këtë.',
    unknown: 'Ndodhi një gabim i panjohur.',
    valueMustBeUnique: 'Vlera duhet të jetë unike',
  },
}

/**
 * The rich text editor's own namespace.
 *
 * `@payloadcms/richtext-lexical` does not read the language pack. Each of its
 * features ships an i18n object keyed by language code and the editor merges
 * only the languages it finds there into `lexical.<featureKey>` — so an
 * unknown code like ours gets an empty `lexical` namespace and every key
 * renders as its own path. That is not a silent degradation: the description
 * field on a property renders the literal text `lexical:general:placeholder`.
 *
 * Payload deep-merges `i18n.translations[lang]` over the pack, and merges the
 * editor's own i18n on top of that (config/sanitize.js) — which cannot clobber
 * this, because the editor has no `sq` to contribute.
 *
 * Keyed by each feature's `key`, mirroring the English bundles in the package.
 * Add a feature to `lexicalEditor()` and its labels come back in English until
 * they are added here.
 */
const lexical = {
  general: {
    placeholder: 'Fillo të shkruash, ose shtyp “/” për komanda…',
    slashMenuBasicGroupLabel: 'Bazë',
    slashMenuListGroupLabel: 'Lista',
    toolbarItemsActive: '{{count}} aktive',
  },
  align: {
    alignCenterLabel: 'Në qendër',
    alignJustifyLabel: 'Të drejtuara në të dyja anët',
    alignLeftLabel: 'Majtas',
    alignRightLabel: 'Djathtas',
  },
  blockquote: { label: 'Citat' },
  blocks: {
    inlineBlocks: {
      create: 'Krijo {{label}}',
      edit: 'Ndrysho {{label}}',
      label: 'Blloqe në rresht',
      remove: 'Hiq {{label}}',
    },
    label: 'Blloqe',
  },
  checklist: { label: 'Listë me shenja' },
  heading: { label: 'Titull {{headingLevel}}' },
  horizontalRule: { label: 'Vijë ndarëse' },
  indent: {
    decreaseLabel: 'Zvogëlo kryeradhën',
    increaseLabel: 'Rrit kryeradhën',
  },
  link: { label: 'Lidhje', loadingWithEllipsis: 'Duke ngarkuar…' },
  orderedList: { label: 'Listë e numërtuar' },
  paragraph: { label: 'Paragraf', label2: 'Tekst normal' },
  relationship: { label: 'Lidhje me dokument' },
  textState: { defaultStyle: 'Stili i parazgjedhur' },
  unorderedList: { label: 'Listë me pika' },
  upload: { label: 'Skedar' },
}

export const sq: LanguagePack = {
  dateFNSKey: 'en-US',
  translations: deepMergeSimple(en.translations, overrides),
}

/** Merged over the pack at request time — see the `lexical` note above. */
export const translations: I18nConfig['translations'] = {
  ['sq' as LanguageCode]: { lexical },
}

/** `sq` is not in Payload's `AcceptedLanguages` — see the note at the top. */
export const SQ_LANGUAGE_CODE = 'sq' as LanguageCode

export const supportedLanguages: SupportedLanguagesMap = {
  [SQ_LANGUAGE_CODE]: sq,
}
