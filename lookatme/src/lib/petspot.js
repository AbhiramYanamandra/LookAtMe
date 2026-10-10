/**
 * The PETspot data model, from the team's UTS 31271 Database Fundamentals
 * report (2022): the revised ERD (Part C.2), its relations (C.3), functional
 * dependencies (C.4) and business rules (C.1). Positions follow the ERD's
 * layout. `pk` and `fk` mark key attributes; associative (enquiry) entities
 * take their keys from the entities they join.
 */
export const ENTITIES = {
  buyer: {
    name: "Buyer",
    x: 260, y: 68, w: 140,
    attrs: [["EmailAddress", "pk"], ["First Name"], ["Last Name"], ["Phone Number"], ["Password"], ["City"], ["State"]],
    relation: "BUYER (EmailAddress, FirstName, LastName, PhoneNumber, Password, City, State)",
    fds: ["EmailAddress → FirstName, LastName, PhoneNumber, Password, City, State"],
    rules: [1, 2, 9, 10],
  },
  seller: {
    name: "Seller",
    x: 520, y: 324, w: 140,
    attrs: [["Identifier", "pk"], ["Email Address"], ["Password"], ["Phone Number"], ["City"], ["State"], ["Rating"]],
    relation: "SELLER (Identifier, EmailAddress, Password, PhoneNumber, City, State, Rating)",
    fds: ["Identifier → EmailAddress, Password, PhoneNumber, City, State, Rating"],
    rules: [3, 4, 6, 8, 11, 12],
  },
  pet: {
    name: "Pet",
    x: 830, y: 68, w: 140,
    attrs: [["PetID", "pk"], ["SellerIdentifier", "pk fk"], ["BreedIdentifier", "fk"], ["Date of Birth"], ["Price"], ["Parent", "fk"], ["Photos"], ["Litter"]],
    relation: "PET (PetID, SellerIdentifier*, DateOfBirth, Price, Parent*, Photos, Litter)",
    fds: ["PetID, SellerIdentifier → DateOfBirth, Price, Parent, Photos, BreedIdentifier, …"],
    rules: [5, 6, 9, 11],
  },
  breeds: {
    name: "Breeds",
    x: 830, y: 324, w: 140,
    attrs: [["Identifier", "pk"], ["Coat"], ["Size"], ["Energy"], ["Shedding"], ["Grooming"], ["Bark"], ["Friendly"]],
    relation: "BREEDS (Identifier, Coat, Size, Energy, Shedding, Grooming, Bark, Friendly)",
    fds: ["BreedIdentifier → Coat, Size, Energy, Shedding, Grooming, Bark, Friendly"],
    rules: [5],
  },
  service: {
    name: "Service",
    x: 0, y: 324, w: 140,
    attrs: [["Identifier", "pk"], ["SellerIdentifier", "pk fk"], ["Title"], ["Description"], ["Cost"], ["City"], ["State"]],
    relation: "SERVICE (Identifier, SellerIdentifier*, Title, Description, Cost, City, State)",
    fds: ["ServiceIdentifier, SellerIdentifier → Title, Description, Cost, City, State"],
    rules: [3, 7, 8, 10],
  },
  buyerPet: {
    name: "Buyer Pet Enquiry",
    assoc: true,
    x: 520, y: 68, w: 140,
    attrs: [["EmailAddress", "pk fk"], ["PetID", "pk fk"], ["DateTime"], ["Status"]],
    relation: "BUYER_PET_ENQUIRY (EmailAddress*, Pet_ID*, DateTime, Status)",
    fds: ["EmailAddress, PetID → DateTime, Status"],
    rules: [9],
  },
  buyerService: {
    name: "Buyer Service Enquiry",
    assoc: true,
    x: 0, y: 68, w: 140,
    attrs: [["EmailAddress", "pk fk"], ["ServiceIdentifier", "pk fk"], ["DateTime"], ["Status"]],
    relation: "BUYER_SERVICE_ENQUIRY (EmailAddress*, Identifier*, DateTime, Status)",
    fds: ["EmailAddress, ServiceIdentifier, SellerIdentifier → DateTime, Status"],
    rules: [10],
  },
  sellerService: {
    name: "Seller Service Enquiry",
    assoc: true,
    x: 250, y: 324, w: 140,
    attrs: [["ServiceIdentifier", "pk fk"], ["SellerIdentifier", "pk fk"], ["DateTime"], ["Status"]],
    relation: "SELLER_SERVICE_ENQUIRY ((ServiceIdentifier, SellerIdentifier)*, SellerIdentifier*, DateTime, Status)",
    fds: ["ServiceIdentifier, SellerIdentifier, SellerIdentifier → DateTime, Status"],
    rules: [12],
  },
  litter: {
    name: "Pet_Litter",
    x: 1060, y: 68, w: 140,
    attrs: [["PetID", "pk fk"], ["SellerIdentifier", "pk fk"], ["Litter Count"]],
    relation: "PET_LITTER ((Pet_ID*, SellerIdentifier*), Litter_Count)",
    fds: ["PetID, SellerIdentifier → LitterID"],
    rules: [5],
  },
  litterId: {
    name: "LitterID",
    x: 1060, y: 208, w: 140,
    attrs: [["LitterID", "pk"], ["PetID", "fk"], ["SellerIdentifier", "fk"]],
    relation: "LITTERID (LitterID, (Pet_ID, SellerIdentifier)*)",
    fds: ["PetID, SellerIdentifier → LitterID"],
    rules: [5],
  },
};

/** [one-side, many-side, identifying?] — the "many" end gets the crow's foot. */
export const RELATIONSHIPS = [
  ["buyer", "buyerService"],
  ["service", "buyerService"],
  ["buyer", "buyerPet"],
  ["pet", "buyerPet"],
  ["breeds", "pet"],
  ["seller", "pet", true],
  ["seller", "service", true],
  ["service", "sellerService"],
  ["seller", "sellerService"],
  ["pet", "litter"],
  ["litter", "litterId"],
];

export const RULES = {
  1: "To interact with posts on the site, you must be logged into a buyer or seller account.",
  2: "A buyer must have a unique email address, and must have a password, phone number and state.",
  3: "To create postings for pets or services, you must be logged into a seller account.",
  4: "A seller is generated a unique ID on creation, with a unique email, password, phone number, rating and address.",
  5: "A pet must have a unique ID, a breed, coat colour, DOB, size and price. It may have a parent and be part of a litter.",
  6: "A pet must be created by a seller.",
  7: "A service posting must have a unique ID, a title, description, cost and location.",
  8: "A service must be created by a seller.",
  9: "A buyer may enquire about many pets; a pet can receive enquiries from many buyers.",
  10: "A buyer may enquire about many services; a service can receive enquiries from many buyers.",
  11: "A seller can create many pets; each pet is created by one seller.",
  12: "A seller may enquire about many services; a service can receive enquiries from many sellers.",
};
