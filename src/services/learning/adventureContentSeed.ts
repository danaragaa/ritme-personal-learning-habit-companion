import type {
  AdventureChapter,
  AdventureRealmInfo,
  PracticeQuestion,
} from '@/types'

export const ADVENTURE_REALMS: AdventureRealmInfo[] = [
  {
    subtestId: 'subtest_pu',
    code: 'PU',
    realmNameId: 'Wilayah Logika',
    realmNameEn: 'Realm of Logic',
    themeId: 'Logika deduktif, pola kuantitatif, dan analisis argumen',
    themeEn: 'Deductive logic, quantitative patterns, and argument analysis',
    icon: 'pu',
  },
  {
    subtestId: 'subtest_ppu',
    code: 'PPU',
    realmNameId: 'Benteng Pengetahuan',
    realmNameEn: 'Knowledge Citadel',
    themeId: 'Makna kata, kepaduan wacana, dan inferensi konteks',
    themeEn: 'Word meaning, discourse coherence, and contextual inference',
    icon: 'ppu',
  },
  {
    subtestId: 'subtest_pbm',
    code: 'PBM',
    realmNameId: 'Suaka Bahasa',
    realmNameEn: 'Language Sanctuary',
    themeId: 'Struktur kalimat efektif, ejaan EYD V, dan koherensi',
    themeEn: 'Effective sentence structure, spelling rules, and coherence',
    icon: 'pbm',
  },
  {
    subtestId: 'subtest_pk',
    code: 'PK',
    realmNameId: 'Zona Kuantitatif',
    realmNameEn: 'Quantitative Frontier',
    themeId: 'Konsep bilangan, aljabar, himpunan, fungsi, dan geometri',
    themeEn: 'Number concepts, algebra, sets, functions, and geometry',
    icon: 'pk',
  },
  {
    subtestId: 'subtest_lbi',
    code: 'LBI',
    realmNameId: 'Arsip Literasi Indonesia',
    realmNameEn: 'Indonesian Archive',
    themeId: 'Analisis wacana mendalam, fakta/opini, dan evaluasi informasi',
    themeEn: 'Deep discourse analysis, fact/opinion, and information evaluation',
    icon: 'lbi',
  },
  {
    subtestId: 'subtest_lbe',
    code: 'LBE',
    realmNameId: 'Ranah Literasi Inggris',
    realmNameEn: 'English Dominion',
    themeId: 'Pemahaman bacaan, gagasan utama, nada penulis, dan inferensi',
    themeEn: 'Reading comprehension, main idea, author tone, and inference',
    icon: 'lbe',
  },
  {
    subtestId: 'subtest_pm',
    code: 'PM',
    realmNameId: 'Palung Matematika',
    realmNameEn: 'Mathematical Abyss',
    themeId: 'Pemodelan matematika kontekstual, peluang, dan pemecahan masalah',
    themeEn: 'Contextual mathematical modeling, probability, and problem solving',
    icon: 'pm',
  },
]

export const DEFAULT_CHAPTERS_SEED: AdventureChapter[] = [
  // PU — Realm of Logic
  {
    id: 'chap_pu_1',
    subtestId: 'subtest_pu',
    order: 1,
    titleId: 'Bab 1: Silogisme, Implikasi & Ekuivalensi Logika',
    titleEn: 'Chapter 1: Syllogism, Implication & Logical Equivalence',
    objectivesId: [
      'Memahami hukum Modus Ponens, Modus Tollens, dan Silogisme Hipotetis.',
      'Mengubah pernyataan implikasi (p -> q) menjadi kontraposisi (~q -> ~p) yang ekuivalen.',
      'Menghindari jebakan kesimpulan tidak sah (converse/inverse fallacy).',
    ],
    objectivesEn: [
      'Master Modus Ponens, Modus Tollens, and Hypothetical Syllogism rules.',
      'Convert implication statements (p -> q) into equivalent contrapositives (~q -> ~p).',
      'Avoid invalid conclusion traps (converse and inverse fallacies).',
    ],
    materialSummaryId:
      '1. Modus Ponens: Jika (p -> q) benar dan p benar, maka q pasti benar.\n2. Modus Tollens: Jika (p -> q) benar dan ~q benar, maka ~p pasti benar.\n3. Silogisme: Jika (p -> q) dan (q -> r), maka (p -> r).\n4. Ekuivalensi Penting: (p -> q) ≡ (~q -> ~p) ≡ (~p v q). Ingat: jika diketahui ~p atau diketahui q saja, kita TIDAK bisa menyimpulkan kepastian nilai lainnya.',
    materialSummaryEn:
      '1. Modus Ponens: Given (p -> q) and p, conclude q.\n2. Modus Tollens: Given (p -> q) and ~q, conclude ~p.\n3. Syllogism: Given (p -> q) and (q -> r), conclude (p -> r).\n4. Key Equivalence: (p -> q) ≡ (~q -> ~p) ≡ (~p v q). Remember: affirming the consequent (q) or denying the antecedent (~p) yields no valid conclusion.',
    exampleId:
      'Contoh: "Jika siswa berlatih rutin (p), maka akurasi meningkat (q). Akurasi Budi tidak meningkat (~q)." Dengan Modus Tollens (~q -> ~p), kesimpulan sah adalah: "Budi tidak berlatih rutin."',
    exampleEn:
      'Example: "If a student practices regularly (p), accuracy improves (q). Budi\'s accuracy did not improve (~q)." By Modus Tollens (~q -> ~p), the valid conclusion is: "Budi did not practice regularly."',
    estimatedMinutes: 25,
    status: 'available',
  },
  {
    id: 'chap_pu_2',
    subtestId: 'subtest_pu',
    order: 2,
    titleId: 'Bab 2: Pola Bilangan & Penalaran Data Grafik',
    titleEn: 'Chapter 2: Number Patterns & Graphical Data Reasoning',
    objectivesId: [
      'Mengidentifikasi pola deret bertingkat, deret larik ganda, dan rasio.',
      'Membaca tren perubahan persentase dan proporsi dari grafik/tabel.',
    ],
    objectivesEn: [
      'Identify multi-level arithmetic, alternating series, and geometric ratios.',
      'Interpret percentage changes and proportions from charts and tables.',
    ],
    materialSummaryId:
      '1. Cek selisih tingkat pertama dan kedua terlebih dahulu.\n2. Jika angka naik-turun secara bergantian, pisahkan menjadi 2 sub-deret (indeks ganjil vs genap).\n3. Untuk soal tabel/grafik: bedakan antara "kenaikan jumlah mutlak" (selisih) dan "persentase kenaikan" ((Baru - Lama)/Lama x 100%).',
    materialSummaryEn:
      '1. Check first-level and second-level differences first.\n2. If numbers fluctuate alternately, split into odd-index and even-index sub-series.\n3. For chart problems: distinguish between absolute increase (difference) and percentage increase ((New - Old)/Old x 100%).',
    exampleId:
      'Contoh Deret: 3, 6, 11, 18, 27, ... Selisih antar suku adalah +3, +5, +7, +9 (bilangan ganjil berurutan). Maka suku berikutnya adalah 27 + 11 = 38.',
    exampleEn:
      'Example Series: 3, 6, 11, 18, 27, ... Differences are +3, +5, +7, +9 (consecutive odd numbers). The next term is 27 + 11 = 38.',
    estimatedMinutes: 25,
    status: 'available',
  },

  // PPU — Knowledge Citadel
  {
    id: 'chap_ppu_1',
    subtestId: 'subtest_ppu',
    order: 1,
    titleId: 'Bab 1: Ide Pokok, Makna Kontekstual & Kepaduan Paragraf',
    titleEn: 'Chapter 1: Main Idea, Contextual Meaning & Paragraph Coherence',
    objectivesId: [
      'Menentukan kalimat utama dan gagasan pokok paragraf secara cepat.',
      'Menganalisis perubahan makna kata (meluas, menyempit, asosiatif) sesuai konteks.',
    ],
    objectivesEn: [
      'Quickly identify topic sentences and main ideas of paragraphs.',
      'Analyze contextual word meanings and semantic relationships.',
    ],
    materialSummaryId:
      '1. Ide pokok terletak pada kalimat utama (biasanya di awal/deduktif atau di akhir/induktif yang ditandai simpulan seperti "Oleh karena itu", "Dengan demikian").\n2. Kalimat penjelas yang tidak mendukung ide pokok disebut kalimat sumbang (tidak padu).\n3. Makna kontekstual selalu bergantung pada kalimat pengapitnya, bukan semata makna kamus berdiri sendiri.',
    materialSummaryEn:
      '1. The main idea resides in the topic sentence (usually first/deductive or last/inductive marked by conclusion connectors).\n2. Supporting sentences that drift away from the main idea break paragraph coherence.\n3. Contextual meaning depends on surrounding clauses rather than isolated dictionary definitions.',
    exampleId:
      'Contoh: Jika kalimat (1) membahas dampak polusi udara pada kesehatan paru-paru dan kalimat (2)-(3) merinci riset medisnya, sedangkan kalimat (4) membahas harga tiket pesawat, maka kalimat (4) tidak padu.',
    exampleEn:
      'Example: If sentence (1) discusses air pollution impacts on lung health and (2)-(3) detail medical studies, while (4) discusses airline ticket prices, sentence (4) breaks coherence.',
    estimatedMinutes: 20,
    status: 'available',
  },
  {
    id: 'chap_ppu_2',
    subtestId: 'subtest_ppu',
    order: 2,
    titleId: 'Bab 2: Sikap Penulis, Analogi & Hubungan Antarkalimat',
    titleEn: 'Chapter 2: Author Attitude, Analogy & Inter-Sentence Relations',
    objectivesId: [
      'Mengenali keberpihakan dan nada penulis (objektif, kritis, optimistis, khawatir).',
      'Menentukan hubungan logis antarkalimat (sebab-akibat, pertentangan, penguatan).',
    ],
    objectivesEn: [
      'Identify author tone and stance (objective, critical, optimistic, concerned).',
      'Determine logical relationships between sentences (cause-effect, contrast, reinforcement).',
    ],
    materialSummaryId:
      '1. Sikap penulis terlihat dari pilihan diksi (kata sifat/keterangan): informasi berbasis data murni = objektif/netral; peringatan bahaya = prihatin/khawatir.\n2. Hubungan pertentangan memakai "Namun", "Akan tetapi"; hubungan penambahan memakai "Selain itu", "Di samping itu".',
    materialSummaryEn:
      '1. Author tone is revealed through diction: purely data-driven facts = objective/neutral; warnings of risk = concerned.\n2. Contrast uses "However/Nevertheless"; addition uses "Furthermore/Moreover".',
    exampleId:
      'Contoh: Kalimat A menyajikan tren positif energi surya, Kalimat B menyajikan kendala biaya baterai. Hubungan B terhadap A adalah mempertentangkan/membatasi.',
    exampleEn:
      'Example: Sentence A presents positive solar energy trends; Sentence B presents battery cost barriers. Sentence B contrasts/qualifies Sentence A.',
    estimatedMinutes: 20,
    status: 'locked',
  },

  // PBM — Language Sanctuary
  {
    id: 'chap_pbm_1',
    subtestId: 'subtest_pbm',
    order: 1,
    titleId: 'Bab 1: EYD V, Kata Baku & Penggunaan Tanda Baca',
    titleEn: 'Chapter 1: Standard Spelling (EYD V) & Punctuation Rules',
    objectivesId: [
      'Membedakan penulisan kata depan (di, ke) vs imbuhan (di-, ke-).',
      'Menguasai penulisan kata baku yang sering menjebak di UTBK.',
      'Menggunakan tanda koma (,) dengan tepat pada konjungsi intrakalimat dan antarkalimat.',
    ],
    objectivesEn: [
      'Distinguish prepositions (spaced) from prefixes (attached).',
      'Master high-frequency standard Indonesian vocabulary.',
      'Apply comma rules accurately for intra-sentence and inter-sentence conjunctions.',
    ],
    materialSummaryId:
      '1. Kata depan "di/ke" menunjuk tempat/arah -> ditulis TERPISAH (di rumah, ke pasar). Imbuhan pasif "di-" menunjuk tindakan -> ditulis SERANGKAI (dibaca, dikelola).\n2. Bentuk gabungan kata yang mendapat awalan DAN akhiran sekaligus ditulis serangkai (mempertanggungjawabkan), jika hanya awalan atau akhiran saja ditulis terpisah (bertanggung jawab).\n3. Konjungsi antarkalimat (Oleh karena itu, Namun, Akan tetapi) WAJIB diikuti tanda koma.',
    materialSummaryEn:
      '1. Prepositions "di/ke" indicating place are written separately; passive prefixes "di-" are attached.\n2. Compound words with both prefix and suffix are written as one word (mempertanggungjawabkan); with only prefix or suffix, separated (bertanggung jawab).\n3. Inter-sentence conjunctions must be followed by a comma.',
    exampleId:
      'Contoh Kata Baku: "praktik" (bukan praktek), "risiko" (bukan resiko), "analisis" (bukan analisa), "hierarki" (bukan hirarki), "aktivitas" (bukan aktifitas).',
    exampleEn:
      'Standard Word Examples: "praktik", "risiko", "analisis", "hierarki", "aktivitas".',
    estimatedMinutes: 25,
    status: 'available',
  },
  {
    id: 'chap_pbm_2',
    subtestId: 'subtest_pbm',
    order: 2,
    titleId: 'Bab 2: Kalimat Efektif, Inti Kalimat & Kehematan Kata',
    titleEn: 'Chapter 2: Effective Sentences, Core Clause & Conciseness',
    objectivesId: [
      'Menentukan Subjek (S) dan Predikat (P) sebagai inti kalimat.',
      'Menghilangkan pleonasme (pemborosan kata) dan ketidakparalelan bentuk.',
    ],
    objectivesEn: [
      'Identify Subject (S) and Predicate (P) as the sentence core.',
      'Eliminate redundancy (pleonasm) and non-parallel grammatical forms.',
    ],
    materialSummaryId:
      '1. Syarat kalimat lengkap: minimal memiliki Subjek (S) dan Predikat (P). Hindari menaruh preposisi (di, dalam, bagi, untuk, pada) tepat di depan Subjek karena mengubah Subjek menjadi Keterangan!\n2. Kehematan: hindari "para siswa-siswi" (cukup "para siswa" atau "siswa-siswi"), "agar supaya" (pilih salah satu).\n3. Keparalelan: jika rincian pertama memakai verba me- (merencanakan), rincian berikutnya harus setara (melaksanakan, mengevaluasi).',
    materialSummaryEn:
      '1. Complete sentences require at least a Subject (S) and Predicate (P). Avoid placing prepositions before the Subject.\n2. Conciseness: avoid double plurals or double conjunctions.\n3. Parallelism: items in a series must share the same grammatical form.',
    exampleId:
      'Contoh Tidak Efektif: "Bagi peserta yang terlambat dilarang masuk." (Tidak punya Subjek karena diawali "Bagi"). Perbaikan: "Peserta yang terlambat dilarang masuk."',
    exampleEn:
      'Ineffective Example: "For participants who are late are prohibited from entering." Fix: "Participants who are late are prohibited from entering."',
    estimatedMinutes: 25,
    status: 'locked',
  },

  // PK — Quantitative Frontier
  {
    id: 'chap_pk_1',
    subtestId: 'subtest_pk',
    order: 1,
    titleId: 'Bab 1: Sifat Bilangan, Eksponen & Manipulasi Aljabar',
    titleEn: 'Chapter 1: Number Properties, Exponents & Algebraic Manipulation',
    objectivesId: [
      'Menyelesaikan bentuk aljabar dengan pemfaktoran cepat (a^2 - b^2 = (a-b)(a+b)).',
      'Menggunakan sifat eksponen dan persamaan linear dalam soal kecukupan data (P vs Q).',
    ],
    objectivesEn: [
      'Solve algebraic expressions using fast factoring identities.',
      'Apply exponent laws and linear equations to quantitative comparison & data sufficiency.',
    ],
    materialSummaryId:
      '1. Identitas Aljabar Utama:\n   - (a + b)^2 = a^2 + 2ab + b^2\n   - (a - b)^2 = a^2 - 2ab + b^2\n   - a^2 - b^2 = (a - b)(a + b)\n2. Eksponen: a^m * a^n = a^(m+n); (a^m)^n = a^(mn); a^(-n) = 1/a^n.\n3. Pada perbandingan kuantitas P dan Q: uji nilai ekstrem (bilangan bulat positif, negatif, pecahan, dan nol) sebelum menyimpulkan!',
    materialSummaryEn:
      '1. Core Algebraic Identities:\n   - (a + b)^2 = a^2 + 2ab + b^2\n   - (a - b)^2 = a^2 - 2ab + b^2\n   - a^2 - b^2 = (a - b)(a + b)\n2. Exponents: a^m * a^n = a^(m+n); (a^m)^n = a^(mn).\n3. In P vs Q comparisons: always test positive, negative, fraction, and zero cases!',
    exampleId:
      'Contoh: Hitung 2026^2 - 2024^2. Gunakan (a-b)(a+b) = (2026 - 2024)(2026 + 2024) = 2 * 4050 = 8100.',
    exampleEn:
      'Example: Compute 2026^2 - 2024^2. Using (a-b)(a+b) = (2026 - 2024)(2026 + 2024) = 2 * 4050 = 8100.',
    estimatedMinutes: 30,
    status: 'available',
  },
  {
    id: 'chap_pk_2',
    subtestId: 'subtest_pk',
    order: 2,
    titleId: 'Bab 2: Geometri Datar, Fungsi Komposisi & Himpunan',
    titleEn: 'Chapter 2: Plane Geometry, Composite Functions & Sets',
    objectivesId: [
      'Menghitung sudut, luas segitiga/lingkaran, dan teorema Pythagoras.',
      'Menyelesaikan fungsi komposisi f(g(x)), fungsi invers, dan diagram Venn.',
    ],
    objectivesEn: [
      'Calculate angles, triangle/circle areas, and apply the Pythagorean theorem.',
      'Solve composite functions f(g(x)), inverse functions, and Venn diagrams.',
    ],
    materialSummaryId:
      '1. Rumus Himpunan 2 Grup: n(A U B) = n(A) + n(B) - n(A ∩ B).\n2. Tripel Pythagoras sering muncul: (3,4,5), (5,12,13), (8,15,17), (7,24,25).\n3. Jika diketahui f(x + k) = ax + b dan ditanya f(c), substitusi langsung x + k = c tanpa perlu mencari rumus umum f(x) terlebih dahulu untuk menghemat waktu.',
    materialSummaryEn:
      '1. Two-Set Union Formula: n(A U B) = n(A) + n(B) - n(A ∩ B).\n2. Common Pythagorean Triples: (3,4,5), (5,12,13), (8,15,17), (7,24,25).\n3. Given f(x + k) and asked for f(c), directly set x + k = c to save time.',
    exampleId:
      'Contoh: Jika f(2x - 1) = 6x + 5, berapakah f(3)? Buat 2x - 1 = 3 -> 2x = 4 -> x = 2. Maka f(3) = 6(2) + 5 = 17.',
    exampleEn:
      'Example: If f(2x - 1) = 6x + 5, find f(3). Set 2x - 1 = 3 -> x = 2. Then f(3) = 6(2) + 5 = 17.',
    estimatedMinutes: 30,
    status: 'locked',
  },

  // LBI — Indonesian Archive
  {
    id: 'chap_lbi_1',
    subtestId: 'subtest_lbi',
    order: 1,
    titleId: 'Bab 1: Evaluasi Informasi, Fakta vs Opini & Simpulan Wacana',
    titleEn: 'Chapter 1: Information Evaluation, Fact vs Opinion & Discourse Conclusion',
    objectivesId: [
      'Membedakan pernyataan fakta terverifikasi dengan opini/asumsi subjektif.',
      'Memvalidasi pernyataan Benar/Salah berdasarkan bukti eksplisit dan implisit bacaan.',
    ],
    objectivesEn: [
      'Distinguish verifiable facts from subjective opinions or assumptions.',
      'Validate True/False statements against explicit and implicit textual evidence.',
    ],
    materialSummaryId:
      '1. Strategi Baca Cepat LBI: Baca pertanyaan dan kata kunci opsi terlebih dahulu, lalu lakukan scanning ke paragraf yang memuat kata kunci tersebut.\n2. Fakta memuat data terukur/peristiwa yang telah terjadi; Opini memuat penilaian subjektif ("sebaiknya", "diperkirakan", "paling indah").\n3. Simpulan yang tepat harus merangkum benang merah teks tanpa menambahkan asumsi di luar bacaan.',
    materialSummaryEn:
      '1. Fast Reading Strategy: Read the question stem and keywords first, then scan the relevant paragraph.\n2. Facts contain verifiable data/events; Opinions contain subjective judgments or predictions.\n3. Valid conclusions synthesize the text without introducing external assumptions.',
    exampleId:
      'Contoh: Teks menyebutkan "Produksi beras naik 12% pada kuartal III." Ini adalah Fakta. Pernyataan "Kenaikan ini membuktikan petani sudah sangat sejahtera" adalah Opini/Asumsi.',
    exampleEn:
      'Example: "Rice production rose 12% in Q3" is a Fact. "This rise proves farmers are already prosperous" is an Opinion/Assumption.',
    estimatedMinutes: 25,
    status: 'available',
  },
  {
    id: 'chap_lbi_2',
    subtestId: 'subtest_lbi',
    order: 2,
    titleId: 'Bab 2: Analisis Teks Sastra, Sains Populer & Multi-Wacana',
    titleEn: 'Chapter 2: Literary Analysis, Popular Science & Multi-Passage Synthesis',
    objectivesId: [
      'Menafsirkan nilai moral, konflik tokoh, dan latar dalam kutipan prosa.',
      'Membandingkan dua sudut pandang teks yang membahas topik serupa.',
    ],
    objectivesEn: [
      'Interpret moral values, character conflict, and setting in prose excerpts.',
      'Compare two passages discussing the same topic from different angles.',
    ],
    materialSummaryId:
      '1. Dalam teks sastra, perhatikan tindakan dan dialog tokoh untuk menyimpulkan watak secara tersirat (show, don\'t tell).\n2. Dalam teks sains/kebijakan publik, fokus pada hubungan kausalitas (penyebab fenomena -> mekanisme -> dampak/solusi).',
    materialSummaryEn:
      '1. In literary texts, observe character actions and dialogue to infer traits implicitly.\n2. In science/policy texts, focus on causal chains (cause -> mechanism -> impact/solution).',
    exampleId:
      'Contoh: Jika Teks 1 menyoroti manfaat AI bagi efisiensi kerja dan Teks 2 menyoroti etika privasi data AI, maka kedua teks saling melengkapi dari sisi manfaat dan risiko.',
    exampleEn:
      'Example: If Text 1 highlights AI efficiency benefits and Text 2 highlights AI data privacy ethics, the two texts complement each other via benefits vs risks.',
    estimatedMinutes: 25,
    status: 'locked',
  },

  // LBE — English Dominion
  {
    id: 'chap_lbe_1',
    subtestId: 'subtest_lbe',
    order: 1,
    titleId: 'Bab 1: Gagasan Utama (Main Idea), Tujuan & Inferensi',
    titleEn: 'Chapter 1: Main Idea, Purpose, Inference & Detail Questions',
    objectivesId: [
      'Mengidentifikasi Main Idea / Primary Purpose dari teks akademik bahasa Inggris.',
      'Menjawab soal Inference (kesimpulan logis tersirat) dan Restatement/Paraphrase.',
    ],
    objectivesEn: [
      'Identify Main Idea and Primary Purpose of academic English passages.',
      'Answer Inference and Restatement/Paraphrase questions accurately.',
    ],
    materialSummaryId:
      '1. Main Idea: Hindari opsi yang terlalu sempit (hanya di 1 kalimat) atau terlalu luas/ekstrem (menggunakan kata "always", "never", "completely" yang tidak ada di teks).\n2. Inference Question ("It can be inferred that..."): jawaban yang benar adalah konsekuensi logis langsung dari kalimat di teks, bukan spekulasi jauh.\n3. Restatement: cari opsi yang mempertahankan inti Subjek-Predikat-Hubungan sebab/akibat dengan sinonim yang setara.',
    materialSummaryEn:
      '1. Main Idea: Avoid options that are too narrow (single detail) or extreme ("always", "never", "only").\n2. Inference: The correct choice must be a direct logical consequence of stated facts.\n3. Restatement: Look for synonymous phrasing that preserves core cause-effect or contrast relations.',
    exampleId:
      'Contoh Restatement: "Despite the harsh climate, the lichen species thrived." Setara dengan: "The lichen species flourished even though the weather conditions were severe."',
    exampleEn:
      'Restatement Example: "Despite the harsh climate, the lichen species thrived." Equivalent to: "The lichen species flourished even though the weather conditions were severe."',
    estimatedMinutes: 25,
    status: 'available',
  },
  {
    id: 'chap_lbe_2',
    subtestId: 'subtest_lbe',
    order: 2,
    titleId: 'Bab 2: Sikap Penulis, Perbandingan Utas & Paragraf Lanjutan',
    titleEn: 'Chapter 2: Author Tone, Thread Comparison & Preceding/Following Paragraph',
    objectivesId: [
      'Menghubungkan opini dari beberapa komentator dalam format Forum/Thread diskusi.',
      'Memprediksi topik paragraf sebelum (preceding) atau sesudah (following).',
    ],
    objectivesEn: [
      'Synthesize opinions across multiple speakers in discussion threads.',
      'Predict the topic of preceding or following paragraphs.',
    ],
    materialSummaryId:
      '1. Soal Forum/Thread: petakan siapa yang setuju (agree), tidak setuju (disagree), atau memberi syarat tambahan terhadap topik utama.\n2. Preceding Paragraph -> lihat kalimat PERTAMA paragraf pertama.\n3. Following Paragraph -> lihat kalimat TERAKHIR paragraf terakhir.',
    materialSummaryEn:
      '1. Thread Questions: map which posters agree, disagree, or propose conditions.\n2. Preceding Paragraph -> check the FIRST sentence of the passage.\n3. Following Paragraph -> check the LAST sentence of the passage.',
    exampleId:
      'Contoh: Jika kalimat terakhir berbunyi "However, implementing this policy requires three major legal reforms", maka paragraf berikutnya pasti merinci ketiga reformasi hukum tersebut.',
    exampleEn:
      'Example: If the final sentence reads "However, implementing this policy requires three major legal reforms", the following paragraph will detail those three reforms.',
    estimatedMinutes: 25,
    status: 'locked',
  },

  // PM — Mathematical Abyss
  {
    id: 'chap_pm_1',
    subtestId: 'subtest_pm',
    order: 1,
    titleId: 'Bab 1: Aritmetika Sosial, Perbandingan & Pemodelan Linear',
    titleEn: 'Chapter 1: Social Arithmetic, Proportions & Linear Modeling',
    objectivesId: [
      'Menerjemahkan soal cerita nyata menjadi persamaan atau pertidaksamaan linear.',
      'Menyelesaikan masalah kecepatan-jarak-waktu, debit kerja bersama, dan diskon bertingkat.',
    ],
    objectivesEn: [
      'Translate real-world word problems into linear equations or inequalities.',
      'Solve speed-distance-time, combined work rate, and successive discount problems.',
    ],
    materialSummaryId:
      '1. Kerja Bersama (Work Rate): Jika A selesai dalam a jam dan B dalam b jam, waktu kerja bersama t memenuhi: 1/t = 1/a + 1/b -> t = (a*b)/(a+b).\n2. Diskon Bertingkat: Diskon 20% lalu 10% BUKAN 30%, melainkan pengguna membayar 0.8 * 0.9 = 0.72 (total diskon efektif 28%).\n3. Perbandingan Berbalik Nilai: (Pekerja_1 * Waktu_1) = (Pekerja_2 * Waktu_2).',
    materialSummaryEn:
      '1. Combined Work Rate: 1/t = 1/a + 1/b -> t = (a*b)/(a+b).\n2. Successive Discounts: 20% followed by 10% pays 0.8 * 0.9 = 0.72 (effective discount 28%, not 30%).\n3. Inverse Proportion: Workers_1 * Days_1 = Workers_2 * Days_2.',
    exampleId:
      'Contoh: Mesin A mencetak 1 batch dalam 6 jam, Mesin B dalam 3 jam. Jika bekerja bersama: t = (6 * 3)/(6 + 3) = 18/9 = 2 jam.',
    exampleEn:
      'Example: Machine A finishes a batch in 6 hours, Machine B in 3 hours. Together: t = (6 * 3)/(6 + 3) = 18/9 = 2 hours.',
    estimatedMinutes: 30,
    status: 'available',
  },
  {
    id: 'chap_pm_2',
    subtestId: 'subtest_pm',
    order: 2,
    titleId: 'Bab 2: Statistika Kontekstual, Kombinatorika & Peluang',
    titleEn: 'Chapter 2: Contextual Statistics, Combinatorics & Probability',
    objectivesId: [
      'Menghitung rata-rata gabungan, median, dan jangkauan dari data kelompok.',
      'Menggunakan aturan perkalian, permutasi, kombinasi, dan peluang kejadian.',
    ],
    objectivesEn: [
      'Compute combined means, medians, and ranges of grouped data.',
      'Apply multiplication rules, permutations, combinations, and probability.',
    ],
    materialSummaryId:
      '1. Rata-rata Gabungan: x_gab = (n1*x1 + n2*x2) / (n1 + n2).\n2. Gunakan Permutasi nPr jika urutan diperhatikan (jabatan ketua-sekretaris, kode PIN); gunakan Kombinasi nCr = n! / (r!(n-r)!) jika urutan TIDAK diperhatikan (memilih tim/delegasi).\n3. Peluang Komplemen: P(minimal satu) = 1 - P(tidak ada sama sekali).',
    materialSummaryEn:
      '1. Combined Mean: x_comb = (n1*x1 + n2*x2) / (n1 + n2).\n2. Use Permutation when order matters; use Combination nCr when order does not matter.\n3. Complement Probability: P(at least one) = 1 - P(none).',
    exampleId:
      'Contoh: Dari 6 kandidat dipilih 2 orang sebagai delegasi (setara). Banyak cara = 6C2 = (6 * 5) / 2 = 15 cara.',
    exampleEn:
      'Example: Choosing 2 equal delegates from 6 candidates: 6C2 = (6 * 5) / 2 = 15 ways.',
    estimatedMinutes: 30,
    status: 'locked',
  },
]

export const DEFAULT_PRACTICE_QUESTIONS_SEED: PracticeQuestion[] = [
  // PU Questions
  {
    id: 'q_pu_1',
    subtestId: 'subtest_pu',
    chapterId: 'chap_pu_1',
    topicId: 'topic_pu_1',
    difficulty: 'easy',
    questionIdText:
      'Semua peserta UTBK yang lolos ke kampus impian memiliki kebiasaan belajar yang terukur. Sebagian siswa kelas XII memiliki kebiasaan belajar yang terukur. Namun, Raka tidak lolos ke kampus impian. Simpulan yang PALING TEPAT adalah...',
    questionEnText:
      'All UTBK participants who pass into their dream university have measurable study habits. Some Grade 12 students have measurable study habits. However, Raka did not pass into his dream university. Which conclusion is MOST ACCURATE?',
    optionsId: [
      'Raka pasti tidak memiliki kebiasaan belajar yang terukur.',
      'Raka adalah siswa kelas XII yang tidak belajar.',
      'Semua siswa kelas XII yang belajar terukur pasti lolos.',
      'Tidak dapat disimpulkan apakah Raka memiliki kebiasaan belajar terukur atau tidak.',
      'Sebagian peserta yang lolos tidak memiliki kebiasaan belajar terukur.',
    ],
    optionsEn: [
      'Raka definitely does not have measurable study habits.',
      'Raka is a Grade 12 student who did not study.',
      'All Grade 12 students with measurable habits will definitely pass.',
      'It cannot be concluded whether Raka has measurable study habits or not.',
      'Some participants who pass do not have measurable study habits.',
    ],
    correctIndex: 3,
    explanationId:
      'Pernyataan utama: "Jika lolos (p), maka punya kebiasaan belajar terukur (q)" atau p -> q. Diketahui Raka tidak lolos (~p). Dalam logika implikasi, mengetahui ~p (mengingkari anteseden) TIDAK dapat menyimpulkan ~q maupun q. Raka bisa saja sudah belajar terukur atau belum.',
    explanationEn:
      'Premise: "If passed (p), then has measurable study habits (q)" (p -> q). Given Raka did not pass (~p). Denying the antecedent (~p) yields no deterministic conclusion about q.',
  },
  {
    id: 'q_pu_2',
    subtestId: 'subtest_pu',
    chapterId: 'chap_pu_1',
    topicId: 'topic_pu_1',
    difficulty: 'medium',
    questionIdText:
      'Jika kualitas tidur terjaga, maka konsentrasi pagi meningkat. Jika konsentrasi pagi meningkat, maka waktu pengerjaan soal menjadi lebih singkat. Ternyata waktu pengerjaan soal Dinda tidak menjadi lebih singkat. Simpulan yang tepat adalah...',
    questionEnText:
      'If sleep quality is maintained, morning concentration increases. If morning concentration increases, problem-solving time becomes shorter. In fact, Dinda\'s problem-solving time did not become shorter. The valid conclusion is...',
    optionsId: [
      'Kualitas tidur Dinda terjaga tetapi soalnya terlalu sulit.',
      'Kualitas tidur Dinda tidak terjaga.',
      'Konsentrasi pagi Dinda meningkat.',
      'Dinda mengerjakan soal di malam hari.',
      'Waktu pengerjaan soal tidak dipengaruhi oleh tidur.',
    ],
    optionsEn: [
      'Dinda\'s sleep quality was maintained but the questions were too hard.',
      'Dinda\'s sleep quality was not maintained.',
      'Dinda\'s morning concentration increased.',
      'Dinda solved questions at night.',
      'Problem-solving time is unaffected by sleep.',
    ],
    correctIndex: 1,
    explanationId:
      'Dengan Silogisme: (p -> q) dan (q -> r) menghasilkan (p -> r): "Jika kualitas tidur terjaga (p), maka waktu pengerjaan lebih singkat (r)." Diketahui ~r (waktu tidak lebih singkat). Dengan Modus Tollens, maka ~p: "Kualitas tidur Dinda tidak terjaga."',
    explanationEn:
      'By Hypothetical Syllogism: (p -> q) and (q -> r) give (p -> r). Given ~r, Modus Tollens yields ~p: "Dinda\'s sleep quality was not maintained."',
  },
  {
    id: 'q_pu_3',
    subtestId: 'subtest_pu',
    chapterId: 'chap_pu_2',
    topicId: 'topic_pu_2',
    difficulty: 'medium',
    questionIdText:
      'Perhatikan barisan bilangan berikut: 4, 7, 13, 25, 49, ... Bilangan selanjutnya pada barisan tersebut adalah...',
    questionEnText:
      'Consider the following number sequence: 4, 7, 13, 25, 49, ... What is the next number in the sequence?',
    optionsId: ['73', '85', '97', '98', '101'],
    optionsEn: ['73', '85', '97', '98', '101'],
    correctIndex: 2,
    explanationId:
      'Selisih antarsuku berturut-turut adalah: +3, +6, +12, +24 (selisihnya selalu dikali 2). Maka selisih berikutnya adalah +48. Suku selanjutnya = 49 + 48 = 97 (atau rumus 2*U_n - 1: 2*49 - 1 = 97).',
    explanationEn:
      'Differences between consecutive terms are +3, +6, +12, +24 (doubling each step). The next difference is +48, so 49 + 48 = 97.',
  },

  // PPU Questions
  {
    id: 'q_ppu_1',
    subtestId: 'subtest_ppu',
    chapterId: 'chap_ppu_1',
    topicId: 'topic_ppu_1',
    difficulty: 'easy',
    questionIdText:
      '(1) Transformasi energi hijau membutuhkan kesiapan infrastruktur jaringan listrik pintar. (2) Tanpa jaringan pintar, pasokan listrik dari panel surya yang fluktuatif sulit distabilkan. (3) Pemerintah daerah juga gencar mengadakan festival kuliner nusantara setiap akhir pekan. (4) Oleh sebab itu, modernisasi gardu distribusi menjadi prioritas utama transisi energi.\n\nKalimat yang TIDAK PADU dalam paragraf di atas adalah...',
    questionEnText:
      '(1) Green energy transformation requires smart grid infrastructure readiness. (2) Without a smart grid, fluctuating solar power supply is hard to stabilize. (3) Local governments also actively host culinary festivals every weekend. (4) Therefore, modernizing distribution substations is a top priority for energy transition.\n\nWhich sentence breaks the coherence of the paragraph?',
    optionsId: [
      'Kalimat (1)',
      'Kalimat (2)',
      'Kalimat (3)',
      'Kalimat (4)',
      'Semua kalimat padu',
    ],
    optionsEn: [
      'Sentence (1)',
      'Sentence (2)',
      'Sentence (3)',
      'Sentence (4)',
      'All sentences are coherent',
    ],
    correctIndex: 2,
    explanationId:
      'Ide pokok paragraf adalah pentingnya infrastruktur jaringan listrik pintar untuk transisi energi hijau (Kalimat 1, 2, dan 4). Kalimat (3) membahas festival kuliner sehingga keluar dari topik utama (kalimat sumbang).',
    explanationEn:
      'The paragraph focuses on smart grid infrastructure for green energy (Sentences 1, 2, and 4). Sentence (3) discusses culinary festivals, breaking coherence.',
  },
  {
    id: 'q_ppu_2',
    subtestId: 'subtest_ppu',
    chapterId: 'chap_ppu_1',
    topicId: 'topic_ppu_1',
    difficulty: 'medium',
    questionIdText:
      '"Kebijakan pembatasan plastik sekali pakai mulai membuahkan hasil yang signifikan di berbagai kota pesisir." Kata "signifikan" pada kalimat tersebut memiliki makna yang paling dekat dengan...',
    questionEnText:
      '"The policy restricting single-use plastics is beginning to yield significant results across coastal cities." The word "signifikan" in this context is closest in meaning to...',
    optionsId: [
      'Sementara',
      'Berarti / penting dan terukur',
      'Seragam',
      'Mengejutkan',
      'Rumit',
    ],
    optionsEn: [
      'Temporary',
      'Meaningful / substantial and measurable',
      'Uniform',
      'Surprising',
      'Complicated',
    ],
    correctIndex: 1,
    explanationId:
      'Dalam KBBI dan konteks kalimat ilmiah/kebijakan, "signifikan" berarti penting, berarti, atau menunjukkan dampak yang nyata/terukur.',
    explanationEn:
      'In academic and policy contexts, "signifikan" (significant) means substantial, meaningful, or showing a measurable impact.',
  },
  {
    id: 'q_ppu_3',
    subtestId: 'subtest_ppu',
    chapterId: 'chap_ppu_2',
    topicId: 'topic_ppu_1',
    difficulty: 'medium',
    questionIdText:
      '"Meskipun adopsi kecerdasan buatan meningkatkan produktivitas industri hingga 30%, ketiadaan regulasi perlindungan data pribadi berpotensi memicu krisis kepercayaan publik." Nada/sikap penulis dalam kutipan tersebut adalah...',
    questionEnText:
      '"Although artificial intelligence adoption boosts industrial productivity by 30%, the absence of personal data protection regulations could trigger a public trust crisis." What is the author\'s tone?',
    optionsId: [
      'Apatis dan acuh tak acuh',
      'Kritis dan waspada',
      'Euforia berlebihan',
      'Sarkastis',
      'Pesimistis mutlak',
    ],
    optionsEn: [
      'Apathetic and indifferent',
      'Critical and cautious',
      'Overly euphoric',
      'Sarcastic',
      'Purely pessimistic',
    ],
    correctIndex: 1,
    explanationId:
      'Penulis mengakui manfaat positif AI (produktivitas +30%) namun sekaligus mengingatkan risiko serius jika tanpa regulasi. Sikap yang menimbang manfaat sekaligus mengingatkan bahaya disebut kritis dan waspada.',
    explanationEn:
      'The author acknowledges positive productivity gains while warning against regulatory gaps, demonstrating a critical and cautious stance.',
  },

  // PBM Questions
  {
    id: 'q_pbm_1',
    subtestId: 'subtest_pbm',
    chapterId: 'chap_pbm_1',
    topicId: 'topic_pbm_1',
    difficulty: 'easy',
    questionIdText:
      'Manakah di antara kalimat berikut yang seluruhnya menggunakan KATA BAKU sesuai EYD V / KBBI?',
    questionEnText:
      'Which of the following sentences uses 100% standard Indonesian spelling according to EYD V / KBBI?',
    optionsId: [
      'Tim peneliti sedang melakukan analisa resiko di laboratorium.',
      'Tim peneliti sedang melakukan analisis risiko di laboratorium.',
      'Tim peneliti sedang melakukan analisis resiko dilaboratorium.',
      'Tim peneliti sedang melakukan analisa risiko di laboratorium.',
      'Tim peneliti sedang melakukan aktifitas analisis risiko di laboratorium.',
    ],
    optionsEn: [
      'Tim peneliti sedang melakukan analisa resiko di laboratorium.',
      'Tim peneliti sedang melakukan analisis risiko di laboratorium.',
      'Tim peneliti sedang melakukan analisis resiko dilaboratorium.',
      'Tim peneliti sedang melakukan analisa risiko di laboratorium.',
      'Tim peneliti sedang melakukan aktifitas analisis risiko di laboratorium.',
    ],
    correctIndex: 1,
    explanationId:
      'Bentuk baku menurut KBBI adalah: "analisis" (bukan analisa), "risiko" (bukan resiko), "aktivitas" (bukan aktifitas), dan kata depan tempat "di laboratorium" ditulis terpisah.',
    explanationEn:
      'Standard forms are "analisis" (not analisa), "risiko" (not resiko), and the preposition of place "di laboratorium" must be separated by a space.',
  },
  {
    id: 'q_pbm_2',
    subtestId: 'subtest_pbm',
    chapterId: 'chap_pbm_2',
    topicId: 'topic_pbm_1',
    difficulty: 'medium',
    questionIdText:
      'Perhatikan kalimat tidak efektif berikut:\n"Dalam rapat evaluasi itu membahas strategi peningkatan literasi digital siswa."\nAgar menjadi kalimat efektif yang memiliki Subjek yang jelas, perbaikan yang tepat adalah...',
    questionEnText:
      'Consider the ineffective sentence:\n"Dalam rapat evaluasi itu membahas strategi peningkatan literasi digital siswa."\nTo make it an effective sentence with a clear Subject, the best revision is...',
    optionsId: [
      'Menambahkan kata "tentang" setelah kata "membahas".',
      'Menghilangkan kata "Dalam" di awal kalimat.',
      'Mengubah kata "membahas" menjadi "pembahasan".',
      'Menambahkan tanda koma setelah kata "itu".',
      'Mengganti kata "Dalam" menjadi "Pada".',
    ],
    optionsEn: [
      'Add "tentang" after "membahas".',
      'Remove the preposition "Dalam" at the beginning of the sentence.',
      'Change "membahas" into the noun "pembahasan".',
      'Add a comma after "itu".',
      'Replace "Dalam" with "Pada".',
    ],
    correctIndex: 1,
    explanationId:
      'Kata depan "Dalam" di awal kalimat membuat "Dalam rapat evaluasi itu" menjadi Keterangan, sehingga kalimat kehilangan Subjek. Dengan menghilangkan kata "Dalam", maka "Rapat evaluasi itu" berfungsi sebagai Subjek (S) dan "membahas" sebagai Predikat (P).',
    explanationEn:
      'Starting with the preposition "Dalam" turns the noun phrase into an adverbial phrase, leaving the sentence without a Subject. Removing "Dalam" makes "Rapat evaluasi itu" the Subject.',
  },
  {
    id: 'q_pbm_3',
    subtestId: 'subtest_pbm',
    chapterId: 'chap_pbm_1',
    topicId: 'topic_pbm_1',
    difficulty: 'medium',
    questionIdText:
      'Penggunaan tanda koma (,) yang TEPAT terdapat pada kalimat...',
    questionEnText:
      'Which sentence demonstrates the CORRECT use of the comma (,)?',
    optionsId: [
      'Dia tidak hadir karena, sedang mengikuti ujian simulasi.',
      'Oleh karena itu, setiap peserta wajib membawa kartu ujian.',
      'Meskipun hujan deras, namun para siswa tetap datang tepat waktu.',
      'Ibu membeli buku, pensil dan, penghapus di koperasi.',
      'Siswa yang rajin berlatih, akan lebih tenang saat ujian.',
    ],
    optionsEn: [
      'Dia tidak hadir karena, sedang mengikuti ujian simulasi.',
      'Oleh karena itu, setiap peserta wajib membawa kartu ujian.',
      'Meskipun hujan deras, namun para siswa tetap datang tepat waktu.',
      'Ibu membeli buku, pensil dan, penghapus di koperasi.',
      'Siswa yang rajin berlatih, akan lebih tenang saat ujian.',
    ],
    correctIndex: 1,
    explanationId:
      'Konjungsi antarkalimat di awal kalimat seperti "Oleh karena itu," wajib diikuti tanda koma. Opsi C salah karena menggabungkan "Meskipun" dan "namun" (konjungsi ganda). Opsi E salah karena memisahkan Subjek dan Predikat dengan koma.',
    explanationEn:
      'Inter-sentence conjunctions at the start of a sentence ("Oleh karena itu,") require a comma immediately after them.',
  },

  // PK Questions
  {
    id: 'q_pk_1',
    subtestId: 'subtest_pk',
    chapterId: 'chap_pk_1',
    topicId: 'topic_pk_1',
    difficulty: 'easy',
    questionIdText:
      'Jika x + y = 12 dan x - y = 4, berapakah nilai dari x^2 - y^2?',
    questionEnText:
      'If x + y = 12 and x - y = 4, what is the value of x^2 - y^2?',
    optionsId: ['16', '36', '48', '64', '144'],
    optionsEn: ['16', '36', '48', '64', '144'],
    correctIndex: 2,
    explanationId:
      'Gunakan identitas selisih kuadrat: x^2 - y^2 = (x + y)(x - y). Substitusi langsung nilai yang diketahui: 12 * 4 = 48. Tidak perlu mencari x dan y satu per satu!',
    explanationEn:
      'Use the difference of squares identity: x^2 - y^2 = (x + y)(x - y) = 12 * 4 = 48.',
  },
  {
    id: 'q_pk_2',
    subtestId: 'subtest_pk',
    chapterId: 'chap_pk_1',
    topicId: 'topic_pk_1',
    difficulty: 'medium',
    questionIdText:
      'Diketahui 2^(x+1) = 32 dan 3^(y-1) = 27. Manakah hubungan yang benar antara kuantitas P dan Q berikut?\nP = x + y\nQ = 8',
    questionEnText:
      'Given 2^(x+1) = 32 and 3^(y-1) = 27. What is the correct relationship between quantities P and Q?\nP = x + y\nQ = 8',
    optionsId: [
      'P > Q',
      'Q > P',
      'P = Q',
      'Informasi yang diberikan tidak cukup untuk memutuskan.',
      'P = 2Q',
    ],
    optionsEn: [
      'P > Q',
      'Q > P',
      'P = Q',
      'The given information is insufficient to decide.',
      'P = 2Q',
    ],
    correctIndex: 2,
    explanationId:
      '2^(x+1) = 32 = 2^5 -> x + 1 = 5 -> x = 4.\n3^(y-1) = 27 = 3^3 -> y - 1 = 3 -> y = 4.\nMaka P = x + y = 4 + 4 = 8. Karena Q = 8, maka P = Q.',
    explanationEn:
      '2^(x+1) = 2^5 gives x = 4. 3^(y-1) = 3^3 gives y = 4. Thus P = x + y = 8, so P = Q.',
  },
  {
    id: 'q_pk_3',
    subtestId: 'subtest_pk',
    chapterId: 'chap_pk_2',
    topicId: 'topic_pk_2',
    difficulty: 'hard',
    questionIdText:
      'Dalam suatu kelas yang terdiri atas 40 siswa, 25 siswa menyukai Matematika, 20 siswa menyukai Fisika, dan 5 siswa tidak menyukai keduanya. Berapa banyak siswa yang menyukai KEDUANYA (Matematika dan Fisika)?',
    questionEnText:
      'In a class of 40 students, 25 like Mathematics, 20 like Physics, and 5 like neither. How many students like BOTH Mathematics and Physics?',
    optionsId: ['5 siswa', '8 siswa', '10 siswa', '12 siswa', '15 siswa'],
    optionsEn: [
      '5 students',
      '8 students',
      '10 students',
      '12 students',
      '15 students',
    ],
    correctIndex: 2,
    explanationId:
      'Jumlah siswa yang menyukai minimal satu pelajaran: n(M U F) = 40 - 5 = 35.\nRumus gabungan: n(M U F) = n(M) + n(F) - n(M ∩ F)\n35 = 25 + 20 - x -> 35 = 45 - x -> x = 10 siswa.',
    explanationEn:
      'Students liking at least one subject: n(M U F) = 40 - 5 = 35. Using n(M U F) = n(M) + n(F) - n(M ∩ F): 35 = 25 + 20 - x -> x = 10.',
  },

  // LBI Questions
  {
    id: 'q_lbi_1',
    subtestId: 'subtest_lbi',
    chapterId: 'chap_lbi_1',
    topicId: 'topic_lbi_1',
    difficulty: 'easy',
    questionIdText:
      'Bacalah kutipan berikut!\n"Ekosistem mangrove mampu menyerap karbon hingga empat kali lebih banyak dibandingkan hutan hujan tropis daratan dengan luas yang sama. Sayangnya, alih fungsi lahan pesisir telah mengurangi luas mangrove Indonesia sekitar 30% dalam tiga dekade terakhir."\n\nPernyataan yang SESUAI dengan isi kutipan di atas adalah...',
    questionEnText:
      'Read the excerpt:\n"Mangrove ecosystems can absorb up to four times more carbon than terrestrial tropical rainforests of the same area. Unfortunately, coastal land conversion has reduced Indonesia\'s mangrove area by roughly 30% over the past three decades."\n\nWhich statement is TRUE according to the passage?',
    optionsId: [
      'Hutan hujan tropis menyerap karbon lebih banyak per hektare daripada mangrove.',
      'Luas mangrove Indonesia saat ini tinggal 30% dari luas awalnya.',
      'Daya serap karbon mangrove per satuan luas lebih tinggi daripada hutan hujan tropis daratan.',
      'Alih fungsi lahan pesisir baru terjadi dalam tiga tahun terakhir.',
      'Mangrove hanya dapat tumbuh di wilayah bebas karbon.',
    ],
    optionsEn: [
      'Tropical rainforests absorb more carbon per hectare than mangroves.',
      'Indonesia\'s remaining mangrove area is only 30% of its original size.',
      'Mangrove carbon absorption per unit area is higher than terrestrial tropical rainforests.',
      'Coastal land conversion only started in the last three years.',
      'Mangroves can only grow in carbon-free zones.',
    ],
    correctIndex: 2,
    explanationId:
      'Kalimat pertama secara eksplisit menyatakan ekosistem mangrove menyerap karbon hingga 4x lebih banyak dibandingkan hutan hujan tropis daratan pada luas yang sama. Opsi B salah karena yang berkurang adalah 30% (berarti tersisa sekitar 70%).',
    explanationEn:
      'The first sentence explicitly states that mangroves absorb up to 4x more carbon than terrestrial rainforests of the same area.',
  },
  {
    id: 'q_lbi_2',
    subtestId: 'subtest_lbi',
    chapterId: 'chap_lbi_1',
    topicId: 'topic_lbi_1',
    difficulty: 'medium',
    questionIdText:
      '(1) Berdasarkan data BPS, tingkat literasi keuangan generasi muda meningkat menjadi 51,4% pada tahun ini. (2) Peningkatan tersebut didorong oleh kemudahan akses aplikasi edukasi investasi. (3) Namun, para pakar menilai generasi muda masih terlalu mudah tergiur imbal hasil instan yang tidak masuk akal. (4) Pemerintah seharusnya memperketat pengawasan iklan investasi bodong di media sosial.\n\nKalimat yang merupakan FAKTA dalam paragraf tersebut adalah...',
    questionEnText:
      '(1) According to BPS data, youth financial literacy rose to 51.4% this year. (2) This increase was driven by accessible investment education apps. (3) However, experts believe young people are still too easily tempted by unrealistic instant returns. (4) The government should tighten oversight of fraudulent investment ads on social media.\n\nWhich sentences represent verifiable FACTS?',
    optionsId: [
      '(1) dan (2)',
      '(1) dan (4)',
      '(2) dan (3)',
      '(3) dan (4)',
      '(4) saja',
    ],
    optionsEn: [
      '(1) and (2)',
      '(1) and (4)',
      '(2) and (3)',
      '(3) and (4)',
      '(4) only',
    ],
    correctIndex: 0,
    explanationId:
      'Kalimat (1) memuat data statistik terukur (51,4%) dan kalimat (2) menjelaskan kondisi faktual pendorongnya. Kalimat (3) memuat penilaian subjektif ("terlalu mudah tergiur") dan kalimat (4) memuat saran/opini ("seharusnya").',
    explanationEn:
      'Sentences (1) and (2) state verifiable statistical data and factual occurrences, whereas (3) and (4) express subjective evaluations and policy recommendations ("should").',
  },
  {
    id: 'q_lbi_3',
    subtestId: 'subtest_lbi',
    chapterId: 'chap_lbi_2',
    topicId: 'topic_lbi_1',
    difficulty: 'medium',
    questionIdText:
      '"Setiap malam, lampu meja belajar kecil di sudut kamar Damar tetap menyala ketika seisi rumah telah lelap. Tumpukan kertas coretan rumus yang penuh tanda silang merah tak membuatnya menutup buku; ia justru mengambil lembar kosong baru dan mengulang dari langkah pertama."\n\nWatak tokoh Damar yang tergambar secara tersirat dalam kutipan tersebut adalah...',
    questionEnText:
      '"Every night, the small desk lamp in the corner of Damar\'s room stayed lit while the rest of the house slept. Stacks of scratch paper covered in red cross marks did not make him close his book; instead, he took a fresh blank sheet and restarted from step one."\n\nWhat character trait of Damar is implicitly portrayed?',
    optionsId: [
      'Ceroboh dan terburu-buru',
      'Gigih dan pantang menyerah dalam belajar',
      'Suka menunda pekerjaan hingga larut malam',
      'Tertutup dan sulit bekerja sama',
      'Perfeksionis yang takut gagal',
    ],
    optionsEn: [
      'Careless and hasty',
      'Persistent and resilient in learning',
      'Prone to procrastinating until late at night',
      'Introverted and uncooperative',
      'Afraid of failure',
    ],
    correctIndex: 1,
    explanationId:
      'Tindakan Damar yang tidak berhenti meski banyak coretan salah (tanda silang merah) dan memilih mengambil kertas baru untuk mengulang dari langkah pertama membuktikan sifat gigih, tekun, dan pantang menyerah.',
    explanationEn:
      'Restarting on a fresh sheet despite repeated mistakes directly illustrates persistence and resilience.',
  },

  // LBE Questions
  {
    id: 'q_lbe_1',
    subtestId: 'subtest_lbe',
    chapterId: 'chap_lbe_1',
    topicId: 'topic_lbe_1',
    difficulty: 'easy',
    questionIdText:
      'Read the passage below:\n"Spaced repetition is an evidence-based learning technique that incorporates increasing intervals of time between subsequent reviews of previously learned material. Unlike cramming—which often leads to rapid forgetting after an exam—spaced repetition leverages the psychological spacing effect to encode knowledge into long-term memory."\n\nWhat is the primary purpose of the passage?',
    questionEnText:
      'Read the passage below:\n"Spaced repetition is an evidence-based learning technique that incorporates increasing intervals of time between subsequent reviews of previously learned material. Unlike cramming—which often leads to rapid forgetting after an exam—spaced repetition leverages the psychological spacing effect to encode knowledge into long-term memory."\n\nWhat is the primary purpose of the passage?',
    optionsId: [
      'To criticize students who prepare for exams.',
      'To explain how spaced repetition works and why it outperforms cramming for long-term retention.',
      'To argue that exams should be abolished in modern education.',
      'To provide a historical biography of memory researchers.',
      'To prove that short-term memory is completely useless.',
    ],
    optionsEn: [
      'To criticize students who prepare for exams.',
      'To explain how spaced repetition works and why it outperforms cramming for long-term retention.',
      'To argue that exams should be abolished in modern education.',
      'To provide a historical biography of memory researchers.',
      'To prove that short-term memory is completely useless.',
    ],
    correctIndex: 1,
    explanationId:
      'Paragraf tersebut mendefinisikan cara kerja spaced repetition (interval waktu yang meningkat) dan membandingkan keunggulannya dibanding sistem kebut semalam (cramming) untuk daya ingat jangka panjang.',
    explanationEn:
      'The passage defines spaced repetition and contrasts its long-term memory benefits against cramming.',
  },
  {
    id: 'q_lbe_2',
    subtestId: 'subtest_lbe',
    chapterId: 'chap_lbe_1',
    topicId: 'topic_lbe_1',
    difficulty: 'medium',
    questionIdText:
      '"Urban heat islands occur when cities replace natural land cover with dense concentrations of pavement and buildings that absorb and retain heat. Consequently, night-time temperatures in metropolitan areas can remain up to 5°C warmer than in surrounding rural regions."\n\nWhat can be inferred from the text?',
    questionEnText:
      '"Urban heat islands occur when cities replace natural land cover with dense concentrations of pavement and buildings that absorb and retain heat. Consequently, night-time temperatures in metropolitan areas can remain up to 5°C warmer than in surrounding rural regions."\n\nWhat can be inferred from the text?',
    optionsId: [
      'Rural areas have more buildings than metropolitan areas.',
      'Preserving natural vegetation in cities could help mitigate night-time warming.',
      'Urban heat islands only happen during the winter season.',
      'Pavement reflects 100% of solar radiation back into space.',
      'Night-time temperatures in cities are always colder than daytime temperatures in villages.',
    ],
    optionsEn: [
      'Rural areas have more buildings than metropolitan areas.',
      'Preserving natural vegetation in cities could help mitigate night-time warming.',
      'Urban heat islands only happen during the winter season.',
      'Pavement reflects 100% of solar radiation back into space.',
      'Night-time temperatures in cities are always colder than daytime temperatures in villages.',
    ],
    correctIndex: 1,
    explanationId:
      'Karena pemanasan dipicu oleh penggantian tutupan lahan alami (natural land cover) dengan beton/aspal yang menyimpan panas, maka mempertahankan vegetasi alami di perkotaan secara logis dapat membantu mengurangi efek pemanasan tersebut.',
    explanationEn:
      'Since heat retention is caused by replacing natural land cover with pavement and buildings, preserving natural vegetation logically helps reduce the warming effect.',
  },
  {
    id: 'q_lbe_3',
    subtestId: 'subtest_lbe',
    chapterId: 'chap_lbe_2',
    topicId: 'topic_lbe_1',
    difficulty: 'medium',
    questionIdText:
      '"While micro-credentials offer rapid skill acquisition for job seekers, employers still struggle to verify the rigor of non-standardized online certificates. To bridge this gap, universities and industry consortia are now developing unified competency frameworks."\n\nWhat would the paragraph FOLLOWING this excerpt most likely discuss?',
    questionEnText:
      '"While micro-credentials offer rapid skill acquisition for job seekers, employers still struggle to verify the rigor of non-standardized online certificates. To bridge this gap, universities and industry consortia are now developing unified competency frameworks."\n\nWhat would the paragraph FOLLOWING this excerpt most likely discuss?',
    optionsId: [
      'The history of nineteenth-century university campuses.',
      'How unified competency frameworks are structured and implemented by universities and industry.',
      'Why job seekers no longer use the internet.',
      'A list of tuition fees for elementary schools.',
      'The decline of computer manufacturing.',
    ],
    optionsEn: [
      'The history of nineteenth-century university campuses.',
      'How unified competency frameworks are structured and implemented by universities and industry.',
      'Why job seekers no longer use the internet.',
      'A list of tuition fees for elementary schools.',
      'The decline of computer manufacturing.',
    ],
    correctIndex: 1,
    explanationId:
      'Untuk memprediksi Following Paragraph, perhatikan kalimat terakhir: "...universities and industry consortia are now developing unified competency frameworks." Paragraf selanjutnya akan merinci bagaimana kerangka kerja kompetensi terpadu tersebut disusun dan diterapkan.',
    explanationEn:
      'The final sentence introduces "unified competency frameworks" developed by universities and industry, so the next paragraph will logically elaborate on those frameworks.',
  },

  // PM Questions
  {
    id: 'q_pm_1',
    subtestId: 'subtest_pm',
    chapterId: 'chap_pm_1',
    topicId: 'topic_pm_1',
    difficulty: 'easy',
    questionIdText:
      'Sebuah toko buku memberikan diskon ganda berturut-turut sebesar 20% kemudian ditambah diskon lagi 10% untuk pemegang kartu pelajar. Jika harga awal sebuah buku persiapan UTBK adalah Rp100.000, berapakah harga akhir yang harus dibayar?',
    questionEnText:
      'A bookstore offers a successive discount of 20% followed by an additional 10% student discount. If the original price of a UTBK prep book is Rp100,000, what is the final price to pay?',
    optionsId: [
      'Rp70.000',
      'Rp72.000',
      'Rp75.000',
      'Rp78.000',
      'Rp80.000',
    ],
    optionsEn: [
      'Rp70,000',
      'Rp72,000',
      'Rp75,000',
      'Rp78,000',
      'Rp80,000',
    ],
    correctIndex: 1,
    explanationId:
      'Harga setelah diskon pertama (20%): 80% x Rp100.000 = Rp80.000.\nHarga setelah diskon tambahan (10% dari Rp80.000): 90% x Rp80.000 = Rp72.000.\nIngat: diskon 20% + 10% bertingkat setara dengan diskon total 28%, bukan 30%.',
    explanationEn:
      'After the first 20% discount: Rp80,000. After the second 10% discount on the discounted price: 0.9 * Rp80,000 = Rp72,000.',
  },
  {
    id: 'q_pm_2',
    subtestId: 'subtest_pm',
    chapterId: 'chap_pm_1',
    topicId: 'topic_pm_1',
    difficulty: 'medium',
    questionIdText:
      'Pompa A dapat mengisi penuh sebuah tangki air dalam waktu 12 menit, sedangkan Pompa B dapat mengisi tangki yang sama dalam waktu 6 menit. Jika kedua pompa dinyalakan bersama-sama dari keadaan kosong, berapa menit waktu yang dibutuhkan hingga tangki penuh?',
    questionEnText:
      'Pump A can fill a water tank in 12 minutes, while Pump B can fill the same tank in 6 minutes. If both pumps operate together starting from an empty tank, how many minutes will it take to fill the tank?',
    optionsId: ['3 menit', '4 menit', '4,5 menit', '5 menit', '9 menit'],
    optionsEn: ['3 minutes', '4 minutes', '4.5 minutes', '5 minutes', '9 minutes'],
    correctIndex: 1,
    explanationId:
      'Gunakan rumus laju kerja bersama: 1/t = 1/12 + 1/6 = 1/12 + 2/12 = 3/12 = 1/4.\nMaka waktu yang dibutuhkan t = 4 menit.',
    explanationEn:
      'Combined rate: 1/t = 1/12 + 1/6 = 3/12 = 1/4. Thus t = 4 minutes.',
  },
  {
    id: 'q_pm_3',
    subtestId: 'subtest_pm',
    chapterId: 'chap_pm_2',
    topicId: 'topic_pm_1',
    difficulty: 'hard',
    questionIdText:
      'Rata-rata nilai simulasi 28 siswa di Kelas A adalah 650. Ketika nilai dari 2 siswa susulan digabungkan, rata-rata seluruh 30 siswa tersebut naik menjadi 656. Berapakah rata-rata nilai dari ke-2 siswa susulan tersebut?',
    questionEnText:
      'The average mock test score of 28 students in Class A is 650. When the scores of 2 make-up students are included, the combined average of all 30 students rises to 656. What is the average score of the 2 make-up students?',
    optionsId: ['680', '710', '720', '740', '750'],
    optionsEn: ['680', '710', '720', '740', '750'],
    correctIndex: 3,
    explanationId:
      'Total nilai 28 siswa = 28 * 650 = 18.200.\nTotal nilai 30 siswa = 30 * 656 = 19.680.\nJumlah nilai 2 siswa susulan = 19.680 - 18.200 = 1.480.\nRata-rata 2 siswa susulan = 1.480 / 2 = 740.\n(Cara cepat: 650 + (30 * 6)/2 = 650 + 90 = 740).',
    explanationEn:
      'Total of 28 students = 18,200. Total of 30 students = 19,680. Sum of the 2 students = 1,480, so their average is 1,480 / 2 = 740.',
  },

  // === PRD 3.0 Expanded Question Bank (Questions 4..6 per Subtest -> 42 Total) ===

  // PU Extended (q_pu_4..6)
  {
    id: 'q_pu_4',
    subtestId: 'subtest_pu',
    chapterId: 'chap_pu_1',
    topicId: 'topic_pu_1',
    difficulty: 'medium',
    questionIdText:
      'Diketahui pernyataan: "Jika harga bahan baku naik, maka biaya produksi meningkat." Pernyataan yang ekuivalen secara logika dengan pernyataan tersebut adalah...',
    questionEnText:
      'Given the statement: "If raw material prices rise, then production costs increase." Which statement is logically equivalent?',
    optionsId: [
      'Jika harga bahan baku tidak naik, maka biaya produksi tidak meningkat.',
      'Jika biaya produksi meningkat, maka harga bahan baku naik.',
      'Jika biaya produksi tidak meningkat, maka harga bahan baku tidak naik.',
      'Harga bahan baku naik atau biaya produksi meningkat.',
      'Biaya produksi selalu meningkat tanpa bergantung pada harga bahan baku.',
    ],
    optionsEn: [
      'If raw material prices do not rise, production costs do not increase.',
      'If production costs increase, raw material prices rise.',
      'If production costs do not increase, raw material prices do not rise.',
      'Raw material prices rise or production costs increase.',
      'Production costs always increase regardless of raw material prices.',
    ],
    correctIndex: 2,
    explanationId:
      'Implikasi (p -> q) selalu ekuivalen dengan kontraposisinya (~q -> ~p). Jadi: "Jika biaya produksi tidak meningkat (~q), maka harga bahan baku tidak naik (~p)."',
    explanationEn:
      'An implication (p -> q) is logically equivalent to its contrapositive (~q -> ~p): "If production costs do not increase, then raw material prices do not rise."',
  },
  {
    id: 'q_pu_5',
    subtestId: 'subtest_pu',
    chapterId: 'chap_pu_2',
    topicId: 'topic_pu_2',
    difficulty: 'medium',
    questionIdText:
      'Perhatikan barisan bilangan berikut: 4, 7, 12, 19, 28, ... Bilangan yang tepat untuk melanjutkan barisan tersebut adalah...',
    questionEnText:
      'Consider the sequence: 4, 7, 12, 19, 28, ... What is the next number in the sequence?',
    optionsId: ['35', '37', '39', '41', '43'],
    optionsEn: ['35', '37', '39', '41', '43'],
    correctIndex: 2,
    explanationId:
      'Selisih antar suku berurutan adalah +3, +5, +7, +9 (bilangan ganjil naik). Maka selisih berikutnya adalah +11, sehingga 28 + 11 = 39.',
    explanationEn:
      'Consecutive differences are +3, +5, +7, +9. The next difference is +11, giving 28 + 11 = 39.',
  },
  {
    id: 'q_pu_6',
    subtestId: 'subtest_pu',
    chapterId: 'chap_pu_2',
    topicId: 'topic_pu_2',
    difficulty: 'hard',
    questionIdText:
      'Penjualan sebuah toko pada kuartal I adalah 200 unit. Pada kuartal II penjualan naik menjadi 250 unit, lalu pada kuartal III turun 20% dibandingkan kuartal II. Manakah simpulan data yang benar?',
    questionEnText:
      'A store sold 200 units in Q1 and 250 units in Q2. In Q3, sales dropped by 20% compared to Q2. Which conclusion is accurate?',
    optionsId: [
      'Penjualan kuartal III sama besar dengan penjualan kuartal I (200 unit).',
      'Penjualan kuartal III lebih rendah 10 unit dari kuartal I.',
      'Penjualan kuartal III naik 5% dibandingkan kuartal I.',
      'Total penurunan kuartal II ke III adalah 40 unit.',
      'Kenaikan kuartal I ke II lebih kecil daripada penurunan kuartal II ke III.',
    ],
    optionsEn: [
      'Q3 sales equal Q1 sales (200 units).',
      'Q3 sales are 10 units lower than Q1.',
      'Q3 sales are 5% higher than Q1.',
      'The drop from Q2 to Q3 is 40 units.',
      'The Q1-to-Q2 increase is smaller than the Q2-to-Q3 drop.',
    ],
    correctIndex: 0,
    explanationId:
      'Penurunan 20% dari 250 unit = 0,20 * 250 = 50 unit. Penjualan kuartal III = 250 - 50 = 200 unit, yang persis sama dengan kuartal I.',
    explanationEn:
      'A 20% decrease from 250 units equals 50 units, resulting in 200 units in Q3, matching Q1.',
  },

  // PPU Extended (q_ppu_4..6)
  {
    id: 'q_ppu_4',
    subtestId: 'subtest_ppu',
    chapterId: 'chap_ppu_1',
    topicId: 'topic_ppu_1',
    difficulty: 'easy',
    questionIdText:
      '"Penggunaan teknologi irigasi tetes membawa akselerasi pada efisiensi air di lahan kering." Sinonim yang paling tepat untuk kata akselerasi dalam konteks kalimat tersebut adalah...',
    questionEnText:
      '"Drip irrigation technology brings acceleration to water efficiency in arid fields." The closest contextual meaning to acceleration is...',
    optionsId: [
      'Pembatasan',
      'Percepatan',
      'Pengurangan',
      'Penstabilan',
      'Penundaan',
    ],
    optionsEn: [
      'Restriction',
      'Speeding up',
      'Reduction',
      'Stabilization',
      'Delay',
    ],
    correctIndex: 1,
    explanationId:
      'Menurut KBBI, akselerasi berarti proses mempercepat atau peningkatan laju kecepatan. Konteks kalimat menunjukkan efisiensi berlangsung lebih cepat.',
    explanationEn:
      'Acceleration denotes speeding up or increasing rate of improvement.',
  },
  {
    id: 'q_ppu_5',
    subtestId: 'subtest_ppu',
    chapterId: 'chap_ppu_2',
    topicId: 'topic_ppu_1',
    difficulty: 'medium',
    questionIdText:
      'Padanan hubungan makna yang paling tepat untuk analogi "Arsitek : Cetak Biru :: Sutradara : ..." adalah...',
    questionEnText:
      'Complete the analogy: "Architect : Blueprint :: Film Director : ..."',
    optionsId: ['Kamera', 'Penonton', 'Panggung', 'Skenario', 'Bioskop'],
    optionsEn: ['Camera', 'Audience', 'Stage', 'Script', 'Cinema'],
    correctIndex: 3,
    explanationId:
      'Arsitek menggunakan cetak biru sebagai rancangan panduan karya bangunan; sutradara menggunakan skenario (naskah) sebagai rancangan panduan produksi film.',
    explanationEn:
      'An architect follows a blueprint to guide construction, just as a director follows a script to guide filmmaking.',
  },
  {
    id: 'q_ppu_6',
    subtestId: 'subtest_ppu',
    chapterId: 'chap_ppu_2',
    topicId: 'topic_ppu_1',
    difficulty: 'hard',
    questionIdText:
      'Sebuah artikel memuji potensi kecerdasan buatan dalam mempercepat diagnosis medis, namun langsung menekankan perlunya audit transparansi algoritma agar bias data tidak merugikan pasien. Sikap penulis dalam kutipan tersebut adalah...',
    questionEnText:
      'An article praises AI potential in accelerating medical diagnosis while insisting on strict algorithmic audits to prevent patient harm from data bias. The author’s attitude is...',
    optionsId: [
      'Apatis dan menolak inovasi',
      'Fanatik tanpa pertimbangan risiko',
      'Kritis sekaligus konstruktif',
      'Pesimistis terhadap dunia medis',
      'Sarkastik dan meremehkan',
    ],
    optionsEn: [
      'Apathetic toward innovation',
      'Uncritically enthusiastic',
      'Critical yet constructive',
      'Pessimistic about medicine',
      'Sarcastic and dismissive',
    ],
    correctIndex: 2,
    explanationId:
      'Penulis mengapresiasi manfaatnya sambil memberi syarat perlindungan etik/teknis (audit), sehingga sikapnya bersifat objektif, kritis, dan konstruktif.',
    explanationEn:
      'Appreciating concrete benefits while proposing protective audits reflects a balanced, critical yet constructive stance.',
  },

  // PBM Extended (q_pbm_4..6)
  {
    id: 'q_pbm_4',
    subtestId: 'subtest_pbm',
    chapterId: 'chap_pbm_1',
    topicId: 'topic_pbm_1',
    difficulty: 'medium',
    questionIdText:
      'Manakah penulisan kalimat yang seluruh ejaan dan tanda bacanya paling tepat sesuai EYD V?',
    questionEnText:
      'Which sentence follows Indonesian EYD V spelling and punctuation rules accurately?',
    optionsId: [
      'Ia tetap hadir meskipun hujan deras; buku itu dijual seharga Rp50.000,00 per eksemplar.',
      'Ia tetap hadir meskipun hujan deras; buku itu dijual seharga Rp. 50.000,- per eksemplar.',
      'Walaupun hujan deras, namun ia tetap hadir di perpustakaan kota.',
      'Di dalam ruangan itu terdapat buku, majalah dan, surat kabar lama.',
      'Setiap peserta wajib membawa alat tulis, pensil 2B, dan penghapus, sebelum ujian dimulai.',
    ],
    optionsEn: [
      'Rp50.000,00 per eksemplar without dot/space after Rp and correct semicolon usage.',
      'Rp. 50.000,- format (incorrect EYD punctuation).',
      'Double conjunction "Walaupun... namun..." (redundant).',
      'Comma misplaced after "dan".',
      'Unnecessary comma before "sebelum ujian dimulai".',
    ],
    correctIndex: 0,
    explanationId:
      'Sesuai EYD V, lambang mata uang "Rp" ditulis tanpa titik dan tanpa spasi sebelum angka (Rp50.000,00), serta partikel "per" bermakna "tiap" ditulis terpisah.',
    explanationEn:
      'In EYD V, "Rp" takes no dot or space before the amount, and "per" meaning "each" is written separately.',
  },
  {
    id: 'q_pbm_5',
    subtestId: 'subtest_pbm',
    chapterId: 'chap_pbm_2',
    topicId: 'topic_pbm_1',
    difficulty: 'medium',
    questionIdText:
      'Inti kalimat dari: "Mahasiswa yang tekun menelaah jurnal ilmiah mutakhir di laboratorium terpadu berhasil meraih beasiswa riset nasional tahun ini." adalah...',
    questionEnText:
      'Identify the core clause (S-P-O) of: "The students who diligently analyzed recent journals in the integrated lab successfully won the national research scholarship this year."',
    optionsId: [
      'Jurnal ilmiah berhasil meraih beasiswa.',
      'Mahasiswa berhasil meraih beasiswa.',
      'Laboratorium terpadu menelaah jurnal ilmiah.',
      'Beasiswa riset nasional diberikan tahun ini.',
      'Mahasiswa tekun berada di laboratorium terpadu.',
    ],
    optionsEn: [
      'Scientific journals won the scholarship.',
      'Students won the scholarship.',
      'The integrated lab analyzed journals.',
      'The national research scholarship is this year.',
      'Diligent students stayed in the lab.',
    ],
    correctIndex: 1,
    explanationId:
      'Klausa perluasan "...yang tekun menelaah... di laboratorium terpadu" hanya menerangkan Subjek. Predikat inti adalah "berhasil meraih" dan Objek inti adalah "beasiswa".',
    explanationEn:
      'Removing the relative modifier leaves the core Subject ("Mahasiswa/Students"), Predicate ("berhasil meraih/won"), and Object ("beasiswa/scholarship").',
  },
  {
    id: 'q_pbm_6',
    subtestId: 'subtest_pbm',
    chapterId: 'chap_pbm_2',
    topicId: 'topic_pbm_1',
    difficulty: 'hard',
    questionIdText:
      'Perhatikan kalimat tidak hemat berikut: "Agar supaya para siswa-siswa bisa meraih nilai maksimal, mereka harus berlatih secara rutin terus-menerus." Bentuk perbaikan paling efektif adalah...',
    questionEnText:
      'Revise this wordy sentence for maximum conciseness: "Agar supaya para siswa-siswa bisa meraih nilai maksimal, mereka harus berlatih secara rutin terus-menerus."',
    optionsId: [
      'Agar supaya para siswa meraih nilai maksimal, mereka berlatih rutin terus-menerus.',
      'Supaya para siswa-siswa meraih nilai maksimal, berlatih rutin terus-menerus.',
      'Untuk agar semua para siswa meraih nilai maksimal, berlatihlah secara rutin.',
      'Agar meraih nilai maksimal, para siswa harus berlatih secara rutin.',
      'Demi supaya siswa-siswa meraih nilai maksimal, mereka berlatih terus.',
    ],
    optionsEn: [
      'Still has redundant "Agar supaya" and "rutin terus-menerus".',
      'Still has redundant "para siswa-siswa" and lacks subject.',
      'Still has ungrammatical "Untuk agar semua para".',
      'Agar meraih nilai maksimal, para siswa harus berlatih secara rutin.',
      'Still has redundant "Demi supaya" and "siswa-siswa".',
    ],
    correctIndex: 3,
    explanationId:
      'Hapus sinonim ganda "Agar supaya" -> pilih salah satu ("Agar"), hilangkan jamak ganda "para siswa-siswa" -> "para siswa", dan rapikan pleonasme "rutin terus-menerus" -> "secara rutin".',
    explanationEn:
      'Eliminate double conjunctions ("Agar supaya"), double plurals ("para siswa-siswa"), and synonymous adverbs ("rutin terus-menerus").',
  },

  // PK Extended (q_pk_4..6)
  {
    id: 'q_pk_4',
    subtestId: 'subtest_pk',
    chapterId: 'chap_pk_1',
    topicId: 'topic_pk_1',
    difficulty: 'medium',
    questionIdText:
      'Jika diketahui 2^(x + 1) = 32 dan 3^y = 27, maka nilai dari x + y adalah...',
    questionEnText:
      'Given 2^(x + 1) = 32 and 3^y = 27, what is the value of x + y?',
    optionsId: ['5', '6', '7', '8', '9'],
    optionsEn: ['5', '6', '7', '8', '9'],
    correctIndex: 2,
    explanationId:
      '32 = 2^5, sehingga x + 1 = 5 -> x = 4.\n27 = 3^3, sehingga y = 3.\nJadi x + y = 4 + 3 = 7.',
    explanationEn:
      'Since 32 = 2^5, x + 1 = 5 gives x = 4. Since 27 = 3^3, y = 3. Therefore x + y = 7.',
  },
  {
    id: 'q_pk_5',
    subtestId: 'subtest_pk',
    chapterId: 'chap_pk_2',
    topicId: 'topic_pk_2',
    difficulty: 'medium',
    questionIdText:
      'Diketahui fungsi f(x) = 2x - 3 dan g(x) = x + 4. Nilai dari fungsi komposisi (f o g)(2) adalah...',
    questionEnText:
      'Given f(x) = 2x - 3 and g(x) = x + 4, evaluate (f o g)(2).',
    optionsId: ['5', '9', '11', '12', '15'],
    optionsEn: ['5', '9', '11', '12', '15'],
    correctIndex: 1,
    explanationId:
      '(f o g)(2) = f(g(2)). Pertama hitung g(2) = 2 + 4 = 6. Lalu f(6) = 2(6) - 3 = 12 - 3 = 9.',
    explanationEn:
      '(f o g)(2) = f(g(2)). First g(2) = 2 + 4 = 6, then f(6) = 2(6) - 3 = 9.',
  },
  {
    id: 'q_pk_6',
    subtestId: 'subtest_pk',
    chapterId: 'chap_pk_2',
    topicId: 'topic_pk_2',
    difficulty: 'hard',
    questionIdText:
      'Sebuah segitiga siku-siku memiliki panjang kedua sisi siku-sikunya 6 cm dan 8 cm. Berapakah panjang jari-jari lingkaran dalam segitiga tersebut?',
    questionEnText:
      'A right triangle has legs of length 6 cm and 8 cm. What is the radius of its inscribed circle (inradius)?',
    optionsId: ['1 cm', '2 cm', '2,5 cm', '3 cm', '5 cm'],
    optionsEn: ['1 cm', '2 cm', '2.5 cm', '3 cm', '5 cm'],
    correctIndex: 1,
    explanationId:
      'Sisi miring = sqrt(6^2 + 8^2) = 10 cm.\nLuas L = (1/2) * 6 * 8 = 24 cm^2.\nSetengah keliling s = (6 + 8 + 10) / 2 = 12 cm.\nJari-jari lingkaran dalam r = L / s = 24 / 12 = 2 cm.',
    explanationEn:
      'Hypotenuse = 10 cm. Area A = 24 cm^2, semi-perimeter s = (6 + 8 + 10)/2 = 12 cm. Inradius r = A/s = 24/12 = 2 cm.',
  },

  // LBI Extended (q_lbi_4..6)
  {
    id: 'q_lbi_4',
    subtestId: 'subtest_lbi',
    chapterId: 'chap_lbi_1',
    topicId: 'topic_lbi_1',
    difficulty: 'easy',
    questionIdText:
      'Perhatikan pernyataan berikut:\n(1) Menurut data resmi lembaga statistik, angka melek huruf nasional tahun ini melampaui 96%.\n(2) Peningkatan tersebut tentu saja berkat kesadaran masyarakat yang luar biasa.\nManakah klasifikasi yang tepat untuk kedua kalimat?',
    questionEnText:
      '(1) According to national census data, literacy exceeded 96% this year. (2) This rise is certainly due to extraordinary public awareness. Classify both sentences.',
    optionsId: [
      'Kalimat (1) adalah fakta dan kalimat (2) adalah opini.',
      'Keduanya merupakan fakta karena memuat topik pendidikan.',
      'Kalimat (1) adalah opini dan kalimat (2) adalah fakta.',
      'Keduanya merupakan opini subjektif penulis.',
      'Kalimat (2) adalah fakta statistik karena merujuk kalimat (1).',
    ],
    optionsEn: [
      'Sentence (1) is fact and sentence (2) is opinion.',
      'Both are facts since they discuss education.',
      'Sentence (1) is opinion and sentence (2) is fact.',
      'Both are subjective author opinions.',
      'Sentence (2) is a statistical fact.',
    ],
    correctIndex: 0,
    explanationId:
      'Kalimat (1) menyajikan data terukur yang dapat diverifikasi (fakta), sedangkan kalimat (2) berisi penilaian subjektif ("tentu saja", "luar biasa") tanpa bukti empiris terukur (opini).',
    explanationEn:
      '(1) presents verifiable census data (fact), whereas (2) offers an interpretive value judgment ("certainly", "extraordinary") (opinion).',
  },
  {
    id: 'q_lbi_5',
    subtestId: 'subtest_lbi',
    chapterId: 'chap_lbi_2',
    topicId: 'topic_lbi_1',
    difficulty: 'medium',
    questionIdText:
      'Dalam kutipan cerpen, ketika musim kemarau panjang mengeringkan sumur warga, Pak RT mengusulkan penggiliran air embung desa secara adil tanpa membedakan status sosial, lalu para pemuda bergotong royong membersihkan saluran irigasi. Nilai sosial dominan dalam kutipan tersebut adalah...',
    questionEnText:
      'In a short story excerpt, during a severe drought, the neighborhood leader organizes fair water rationing for every household regardless of status, and youths volunteer to clear the channels. Which social value dominates?',
    optionsId: [
      'Persaingan individu demi bertahan hidup',
      'Kepatuhan buta tanpa musyawarah',
      'Keadilan distributif dan gotong royong kolektif',
      'Ketergantungan penuh pada bantuan luar',
      'Pengabaian tradisi warga desa',
    ],
    optionsEn: [
      'Individual competition for survival',
      'Blind obedience without discussion',
      'Distributive fairness and collective mutual aid',
      'Complete dependence on external aid',
      'Neglect of community traditions',
    ],
    correctIndex: 2,
    explanationId:
      'Penggiliran air secara adil bagi semua warga mencerminkan keadilan sosial, dan kerja sama pemuda membersihkan saluran menegaskan semangat gotong royong.',
    explanationEn:
      'Fair water rotation and youth teamwork explicitly highlight distributive justice and collective mutual aid.',
  },
  {
    id: 'q_lbi_6',
    subtestId: 'subtest_lbi',
    chapterId: 'chap_lbi_2',
    topicId: 'topic_lbi_1',
    difficulty: 'hard',
    questionIdText:
      'Teks 1 menyatakan bahwa subsidi tarif transportasi massal mendongkrak jumlah komuter perkotaan secara drastis. Teks 2 mengingatkan bahwa subsidi tanpa integrasi rute pengumpan di pinggiran kota justru membebani anggaran tanpa mengurangi kemacetan total. Sintesis paling tepat antara Teks 1 dan Teks 2 adalah...',
    questionEnText:
      'Text 1 states public transit fare subsidies boost commuter ridership sharply. Text 2 warns that subsidies without feeder-route integration strain budgets without reducing traffic congestion. What is the best synthesis?',
    optionsId: [
      'Subsidi transportasi harus dihentikan permanen di seluruh kota.',
      'Rute pengumpan tidak berdampak apa pun terhadap pengguna kendaraan pribadi.',
      'Teks 2 membantah sepenuhnya temuan data pada Teks 1.',
      'Efektivitas subsidi tarif perlu diimbangi pembangunan integrasi rute pengumpan agar kemacetan benar-benar turun.',
      'Kemacetan kota hanya bisa diatasi dengan menaikkan tarif angkutan umum.',
    ],
    optionsEn: [
      'Transit subsidies should be stopped permanently.',
      'Feeder routes have zero impact on private car drivers.',
      'Text 2 completely refutes Text 1 ridership data.',
      'Fare subsidies should be paired with feeder-route integration so ridership gains translate into lower congestion.',
      'Urban congestion can only be solved by raising fares.',
    ],
    correctIndex: 3,
    explanationId:
      'Teks 1 menyoroti efektivitas tarif murah untuk minat naik transit; Teks 2 melengkapi syarat strukturalnya (integrasi rute). Gabungan logisnya adalah subsidi yang dibarengi integrasi rute.',
    explanationEn:
      'Text 1 establishes ridership sensitivity to fare subsidies; Text 2 adds the missing operational prerequisite of feeder integration.',
  },

  // LBE Extended (q_lbe_4..6)
  {
    id: 'q_lbe_4',
    subtestId: 'subtest_lbe',
    chapterId: 'chap_lbe_1',
    topicId: 'topic_lbe_1',
    difficulty: 'medium',
    questionIdText:
      '"Coastal mangrove belts help mitigate the destructive force of tropical storm surges before they reach residential zones." In this sentence, the word "mitigate" is closest in meaning to...',
    questionEnText:
      '"Coastal mangrove belts help mitigate the destructive force of tropical storm surges before they reach residential zones." In this sentence, the word "mitigate" is closest in meaning to...',
    optionsId: ['intensify', 'alleviate', 'ignore', 'accelerate', 'replace'],
    optionsEn: ['intensify', 'alleviate', 'ignore', 'accelerate', 'replace'],
    correctIndex: 1,
    explanationId:
      '"Mitigate" dalam konteks mitigasi bencana berarti meredam, meringankan, atau mengurangi dampak buruk (sepadan dengan "alleviate" atau "lessen").',
    explanationEn:
      '"Mitigate" means to make less severe or painful, which matches "alleviate".',
  },
  {
    id: 'q_lbe_5',
    subtestId: 'subtest_lbe',
    chapterId: 'chap_lbe_2',
    topicId: 'topic_lbe_1',
    difficulty: 'medium',
    questionIdText:
      'A researcher writes: "Preliminary trial results from the new solar desalination membrane look promising; however, long-term durability in high-salinity water still requires multi-year field testing." What is the tone of this passage?',
    questionEnText:
      'A researcher writes: "Preliminary trial results from the new solar desalination membrane look promising; however, long-term durability in high-salinity water still requires multi-year field testing." What is the tone of this passage?',
    optionsId: [
      'Objective and cautious',
      'Dismissive and cynical',
      'Overly sensational',
      'Nostalgic and personal',
      'Aggressive and defensive',
    ],
    optionsEn: [
      'Objective and cautious',
      'Dismissive and cynical',
      'Overly sensational',
      'Nostalgic and personal',
      'Aggressive and defensive',
    ],
    correctIndex: 0,
    explanationId:
      'Penulis mengakui hasil awal menjanjikan ("promising") namun memberi batasan ilmiah tentang perlunya uji lanjutan ("however... still requires"), ciri nada objektif dan hati-hati (objective and cautious).',
    explanationEn:
      'Acknowledging promising early data while noting pending multi-year testing demonstrates an objective and cautious scientific tone.',
  },
  {
    id: 'q_lbe_6',
    subtestId: 'subtest_lbe',
    chapterId: 'chap_lbe_2',
    topicId: 'topic_lbe_1',
    difficulty: 'hard',
    questionIdText:
      'In an academic forum:\nDr. Rina: "Open-access scientific datasets dramatically shorten research replication cycles across developing institutions."\nProf. Hadi: "While open datasets accelerate replication, without standardized metadata curation they risk spreading subtle measurement errors."\nHow does Prof. Hadi respond to Dr. Rina?',
    questionEnText:
      'In an academic forum:\nDr. Rina: "Open-access scientific datasets dramatically shorten research replication cycles across developing institutions."\nProf. Hadi: "While open datasets accelerate replication, without standardized metadata curation they risk spreading subtle measurement errors."\nHow does Prof. Hadi respond to Dr. Rina?',
    optionsId: [
      'He rejects open-access datasets as completely useless.',
      'He shifts the topic away from scientific replication.',
      'He acknowledges the speed benefit while adding a necessary quality-control condition.',
      'He accuses Dr. Rina of fabricating empirical errors.',
      'He claims developing institutions should avoid sharing data.',
    ],
    optionsEn: [
      'He rejects open-access datasets as completely useless.',
      'He shifts the topic away from scientific replication.',
      'He acknowledges the speed benefit while adding a necessary quality-control condition.',
      'He accuses Dr. Rina of fabricating empirical errors.',
      'He claims developing institutions should avoid sharing data.',
    ],
    correctIndex: 2,
    explanationId:
      'Frasa "While open datasets accelerate replication..." menyetujui manfaat kecepatan, lalu diikuti syarat kontrol kualitas ("without standardized metadata curation...").',
    explanationEn:
      '"While open datasets accelerate replication" concedes the speed benefit before stipulating the metadata curation requirement.',
  },

  // PM Extended (q_pm_4..6)
  {
    id: 'q_pm_4',
    subtestId: 'subtest_pm',
    chapterId: 'chap_pm_1',
    topicId: 'topic_pm_1',
    difficulty: 'medium',
    questionIdText:
      'Harga 2 tiket dewasa dan 3 tiket anak di sebuah museum sains adalah Rp190.000, sedangkan harga 1 tiket dewasa dan 2 tiket anak adalah Rp110.000. Berapakah harga 1 tiket dewasa?',
    questionEnText:
      'At a science museum, 2 adult tickets and 3 child tickets cost Rp190,000, while 1 adult ticket and 2 child tickets cost Rp110,000. What is the price of 1 adult ticket?',
    optionsId: [
      'Rp40.000',
      'Rp50.000',
      'Rp55.000',
      'Rp60.000',
      'Rp80.000',
    ],
    optionsEn: [
      'Rp40,000',
      'Rp50,000',
      'Rp55,000',
      'Rp60,000',
      'Rp80,000',
    ],
    correctIndex: 1,
    explanationId:
      'Misalkan D = tiket dewasa, A = tiket anak.\n(1) 2D + 3A = 190.000\n(2) D + 2A = 110.000 -> kalikan 2: 2D + 4A = 220.000.\nKurangkan persamaan: A = 30.000.\nSubstitusi ke (2): D + 2(30.000) = 110.000 -> D = Rp50.000.',
    explanationEn:
      'Doubling D + 2A = 110,000 gives 2D + 4A = 220,000. Subtracting 2D + 3A = 190,000 yields A = 30,000, so D = 110,000 - 60,000 = Rp50,000.',
  },
  {
    id: 'q_pm_5',
    subtestId: 'subtest_pm',
    chapterId: 'chap_pm_2',
    topicId: 'topic_pm_1',
    difficulty: 'medium',
    questionIdText:
      'Dari 5 siswa putri dan 4 siswa putra akan dipilih 2 orang perwakilan secara acak untuk mengikuti olimpiade. Peluang terpilihnya tepat 1 siswa putri dan 1 siswa putra adalah...',
    questionEnText:
      'Two representatives are randomly chosen from 5 female students and 4 male students. What is the probability of selecting exactly 1 female and 1 male student?',
    optionsId: ['4/9', '1/2', '5/9', '2/3', '5/18'],
    optionsEn: ['4/9', '1/2', '5/9', '2/3', '5/18'],
    correctIndex: 2,
    explanationId:
      'Banyak cara total memilih 2 orang dari 9 siswa = C(9,2) = (9 * 8)/2 = 36.\nBanyak cara memilih 1 putri dari 5 dan 1 putra dari 4 = 5 * 4 = 20.\nPeluang = 20 / 36 = 5/9.',
    explanationEn:
      'Total pairs = C(9,2) = 36. Favorable pairs (1 female, 1 male) = 5 * 4 = 20. Probability = 20/36 = 5/9.',
  },
  {
    id: 'q_pm_6',
    subtestId: 'subtest_pm',
    chapterId: 'chap_pm_2',
    topicId: 'topic_pm_1',
    difficulty: 'hard',
    questionIdText:
      'Diketahui lima data bilangan terurut dari terkecil ke terbesar: 4, 7, x, 11, 14. Jika rata-rata kelima data tersebut tepat sama dengan mediannya, maka nilai x adalah...',
    questionEnText:
      'Five ordered numbers from least to greatest are 4, 7, x, 11, 14. If the arithmetic mean of the five numbers equals their median, what is x?',
    optionsId: ['7', '8', '9', '10', '11'],
    optionsEn: ['7', '8', '9', '10', '11'],
    correctIndex: 2,
    explanationId:
      'Karena data sudah terurut dengan 5 bilangan, mediannya adalah suku tengah yaitu x.\nRata-rata = (4 + 7 + x + 11 + 14) / 5 = (36 + x) / 5.\nSamakan dengan median: (36 + x) / 5 = x -> 36 + x = 5x -> 4x = 36 -> x = 9.',
    explanationEn:
      'With 5 ordered numbers, the median is the middle value x. Setting mean equal to median: (36 + x)/5 = x gives 4x = 36, so x = 9.',
  },
]
