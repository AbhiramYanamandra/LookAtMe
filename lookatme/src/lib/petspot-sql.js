/**
 * Part D of the PETspot assignment: the team's PostgreSQL script (PartD.SQL,
 * 15 Oct 2022) and the output of its queries. Results were produced by running
 * the script unchanged on PostgreSQL 17; NULL costs print as blanks there and
 * as "NULL" here.
 */
export const CREATE_SQL = `CREATE TABLE Seller
( SellerID       NUMERIC(32) NOT NULL UNIQUE,
  EmailAddress   VARCHAR(50) NOT NULL,
  Password       VARCHAR(50) NOT NULL,
  PhoneNumber    VARCHAR(25) NOT NULL,
  Location_City  VARCHAR(25) NOT NULL,
  Location_State VARCHAR(25) NOT NULL,
  Rating         NUMERIC(12) NOT NULL,
  CONSTRAINT Seller_pk PRIMARY KEY (SellerID));

CREATE TABLE Service
( ServiceID   NUMERIC(32) NOT NULL UNIQUE,
  SellerID    NUMERIC(32) NOT NULL UNIQUE,
  Title       VARCHAR(50) NOT NULL,
  Description VARCHAR(150) NOT NULL,
  Cost        NUMERIC(10),
  Location_City  VARCHAR(25),
  Location_State VARCHAR(25),
  CONSTRAINT Service_pk PRIMARY KEY (ServiceID, SellerID),
  CONSTRAINT Service_fk0 FOREIGN KEY (SellerID) REFERENCES Seller(SellerID));

CREATE TABLE Seller_Service_Enquiry
( SellerID     NUMERIC(32) NOT NULL,
  ServSellerID NUMERIC(32) NOT NULL,
  ServiceID    NUMERIC(32) NOT NULL,
  DateTime     VARCHAR(32) NOT NULL,
  Status       VARCHAR(32) NOT NULL,
  CONSTRAINT Seller_Service_Enquiry_pk PRIMARY KEY (SellerID, ServSellerID, ServiceID),
  CONSTRAINT Seller_Service_Enquiry_fk0 FOREIGN KEY (SellerID) REFERENCES Seller(SellerID),
  CONSTRAINT Seller_Service_Enquiry_fk1 FOREIGN KEY (ServSellerID) REFERENCES Service(SellerID),
  CONSTRAINT Seller_Service_Enquiry_fk2 FOREIGN KEY (ServiceID) REFERENCES Service(ServiceID));`;

const SERVICE_COLS = ["serviceid", "sellerid", "title", "description", "cost", "location_city", "location_state"];
const SERVICES = [
  ["2626", "680963", "Big Dog Wash", "Will wash your big dog", "10", "Sydney", "NSW"],
  ["1614", "987328", "Dog sitter", "Will sit on your dog", "NULL", "Sydney", "NSW"],
  ["2196", "528152", "Dog watcher", "Will watch your dog from accross the street", "3", "Penrith", "NSW"],
  ["7333", "696295", "Database lessons", "Will teach your dog database fundamentals", "404", "Sydney", "NSW"],
  ["3685", "528302", "Dog Groomer", "Will tell your dog they are very mature for their age", "NULL", "Perth", "WA"],
  ["1841", "790952", "Dog sitting services", "Will teach your dog to sit", "50", "Newcastle", "NSW"],
];

export const QUERIES = [
  {
    id: "2.b.3",
    kind: "SELECT *",
    question: "Show me all services and their information",
    sql: "SELECT * FROM service;",
    cols: SERVICE_COLS,
    rows: SERVICES,
  },
  {
    id: "2.b.2",
    kind: "SELECT *",
    question: "Show all enquiries and their information",
    sql: "SELECT * FROM Seller_Service_Enquiry;",
    cols: ["sellerid", "servsellerid", "serviceid", "datetime", "status"],
    rows: [
      ["680963", "696295", "7333", "20221015:093015", "Open"],
      ["676987", "790952", "1841", "20221011:114512", "Closed"],
      ["659104", "987328", "1614", "20211231:235959", "TimedOut"],
      ["602616", "528152", "2196", "20221009:153650", "Open"],
      ["696295", "987328", "1614", "20120323:041212", "TimedOut"],
    ],
  },
  {
    id: "3.a",
    kind: "GROUP BY",
    question: "Get the most expensive service by state",
    sql: "SELECT round(avg(Cost), 2), Location_State\nFROM service\nGROUP BY Location_State;",
    cols: ["round", "location_state"],
    rows: [
      ["NULL", "WA"],
      ["116.75", "NSW"],
    ],
  },
  {
    id: "3.b",
    kind: "INNER JOIN",
    question: "Show me all services and the information regarding their sellers",
    sql: "SELECT *\nFROM service sv\nINNER JOIN Seller sl ON sv.SellerID = sl.SellerID;",
    cols: ["serviceid", "title", "cost", "location_state", "sl.sellerid", "emailaddress", "rating"],
    note: "14 columns returned; the main ones shown.",
    rows: [
      ["2626", "Big Dog Wash", "10", "NSW", "680963", "john.blogs@EmailAddress.com", "4"],
      ["1614", "Dog sitter", "NULL", "NSW", "987328", "foo.bar@mysql.inbox", "6"],
      ["1841", "Dog sitting services", "50", "NSW", "790952", "integernotfound@error404.x", "8"],
      ["7333", "Database lessons", "404", "NSW", "696295", "RickyIsDaBest@UTS.com", "12"],
      ["3685", "Dog Groomer", "NULL", "WA", "528302", "WillPay4MoreMarks@legit.offer", "5"],
      ["2196", "Dog watcher", "3", "NSW", "528152", "plzgivefullmarks@gmail.com", "12"],
    ],
  },
  {
    id: "3.c",
    kind: "Subquery",
    question: "Show me the cheapest (not free) service in NSW",
    sql: "SELECT * FROM service\nWHERE Cost = (SELECT min(cost) FROM service\n              WHERE Location_State = 'NSW');",
    cols: SERVICE_COLS,
    rows: [["2196", "528152", "Dog watcher", "Will watch your dog from accross the street", "3", "Penrith", "NSW"]],
  },
];

export const COUNTS = { tables: 3, sellers: 10, services: 6, enquiries: 5 };
