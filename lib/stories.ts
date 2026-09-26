/** Student voices, guests, the podcast, and photographs of the centre. */

export type StudentReview = {
  id: string
  name: string
  /** the batch ICT prints on the review card */
  batch: string
  exam: "APSC" | "ADRE"
}

/** ICT's "Student Review" shorts. Name and batch come off each card. */
export const studentReviews: StudentReview[] = [
  {
    id: "iMTV56lmQpQ",
    name: "Priya Chario Deuri",
    batch: "Victor 7",
    exam: "ADRE",
  },
  { id: "ipaMDRbfhms", name: "Himadri Dutta", batch: "Asha", exam: "APSC" },
  { id: "746gEBLxB28", name: "Aaradhya Bhuyan", batch: "Asha", exam: "APSC" },
  { id: "Ocg2NUu-nA0", name: "Uttara Boruah", batch: "Victor 6", exam: "ADRE" },
  { id: "kA7eJM7yDeM", name: "Pakija Das", batch: "Lakhya 25", exam: "APSC" },
  {
    id: "agZ9u6FDEU0",
    name: "Shadananda Dewri",
    batch: "Victor 1",
    exam: "ADRE",
  },
  {
    id: "GzQtvSsBmuk",
    name: "Biswajit Dutta",
    batch: "Victor 3",
    exam: "ADRE",
  },
  { id: "8mdCFUcthmc", name: "Anupol Dutta", batch: "Lakhya", exam: "APSC" },
  {
    id: "7gWFBJSuhJI",
    name: "Niharika Konwar",
    batch: "Victor 6",
    exam: "ADRE",
  },
  {
    id: "NZJ3nimdiTE",
    name: "Fatima Yasmin",
    batch: "APSC batch",
    exam: "APSC",
  },
]

/**
 * ICT's own "Success Stories" video. Unlike the two APSC officers, this one
 * cannot be checked against a published result, so it is credited to ICT
 * rather than presented as verified.
 */
export const publishedStories = [
  {
    id: "Z2scjNS7hs0",
    name: "Mithu Guwala",
    outcome: "Assam Police",
    note: "From ICT's own Success Stories video.",
  },
] as const

/**
 * Axom Dhwani, ICT's podcast, hosted by Raheef R Aowal with Izaaz Ahmed.
 * The most watched thing on the entire channel is an episode of this, not a
 * lecture, which is worth the owner knowing.
 */
export const podcast = {
  name: "Axom Dhwani",
  hosts: "Raheef R Aowal with Izaaz Ahmed",
  seriesViews: 153_454,
  episodes: [
    {
      id: "bgPyAsrJm7k",
      title: "Ahom Moidams, the hidden story",
      guest: "On the UNESCO world heritage site",
      views: 12_938,
    },
    {
      id: "rpmFj0fq9JM",
      title: "Cinema Cinema Cinema",
      guest: "With Zerifa Wahid, actor and producer",
      views: 5_120,
    },
    {
      id: "UY-LlHq4PXw",
      title: "Kamakhya Temple, the untold secrets of history",
      guest: "On the temple and its record",
      views: 4_333,
    },
    {
      id: "HKxMFDnEIDM",
      title: "Dibrugarh, smart city or swimming pool?",
      guest: "With Harkaran Singh, senior faculty",
      views: 2_157,
    },
    {
      id: "laCVSdL9sP0",
      title: "Geopolitics, the game of power",
      guest: "With Sazzad Hussain, international relations columnist",
      views: 852,
    },
    {
      id: "0nbXmaZ-jk0",
      title: "Walk the Talk with Rupamoni Gorh",
      guest: "The first Assamese woman to climb Everest",
      views: 682,
    },
  ],
} as const

/** Bijoyee Bartalaap: serving officers who came to talk to ICT students. */
export const guestSessions = [
  {
    id: "dc1FYXMg0vU",
    name: "Anand Mishra",
    role: "IPS, SP North Lakhimpur",
    detail: "UPSC AIR 225",
    views: 11_251,
  },
  {
    id: "XuZRdHJGUs4",
    name: "Princhi Baruah",
    role: "DySP (HQ) Lakhimpur",
    detail: "APS rank 37, batch of 2022",
    views: 8_361,
  },
  {
    id: "6m3T94eVZaI",
    name: "Darathi Gogoi",
    role: "Employment Officer",
    detail: "APSC batch of 2022",
    views: 2_376,
  },
  {
    id: "UlniJIgxBfk",
    name: "Koushik K Saikia",
    role: "District Transport Officer",
    detail: "Rank 1, APSC CCE 2024",
    views: 389,
  },
  {
    id: "FUDpv5RzFtc",
    name: "Kangkana Dutta",
    role: "Assam Finance Service",
    detail: "Rank 26, APSC CCE 2024",
    views: 524,
  },
] as const

/**
 * Photographs of the actual centre, taken from ICT's own videos. Until these,
 * the site had no picture of the place a student would walk into.
 */
export const campus = [
  {
    src: "/campus/mock-hall.jpg",
    alt: "Students sitting a Warrior mock test in the ICT classroom in North Lakhimpur",
    caption: "Warrior mock test, in the classroom",
    video: "4vHNpAkRF-U",
  },
  {
    src: "/campus/mock-invigilator.jpg",
    alt: "A full hall of students writing a Bijoy mock test at ICT",
    caption: "Bijoy mock test, a full hall",
    video: "fxzyYsyYTkw",
  },
  {
    src: "/campus/digital-classroom.jpg",
    alt: "Desks with computers in the ICT digital classroom on DC Bungalow Road",
    caption: "The digital classroom",
    video: "bgO41ZWz2WQ",
  },
  {
    src: "/campus/students-writing.jpg",
    alt: "Students writing at desks in the ICT classroom",
    caption: "An ordinary class day",
    video: "8nbjJrSIMJk",
  },
  {
    src: "/campus/guest-session.jpg",
    alt: "A guest officer speaking to ICT students at the board",
    caption: "A guest session at the board",
    video: "4CuedS2hVLk",
  },
  {
    src: "/campus/event.jpg",
    alt: "ICT students at a session with Sumit Sattawan, IAS, Deputy Commissioner of Lakhimpur",
    caption: "A full house for a visiting officer",
    video: "y1HYrUx54jU",
  },
] as const

export function thumb(id: string) {
  return `/yt/${id}.jpg`
}
