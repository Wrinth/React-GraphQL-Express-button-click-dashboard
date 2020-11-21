const express = require("express");
var cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
var { graphqlHTTP } = require("express-graphql");
var { buildSchema } = require("graphql");

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  input ClickInput {
    color: String
  }

  input MessageInput {
    content: String
    author: String
  }

  type ClickRecord {
    id: ID!
    color: String
    clickTime: String
  }

  type Message {
    id: ID!
    content: String
    author: String
  }

  type RandomDie {
    numSides: Int!
    rollOnce: Int!
    roll(numRolls: Int!): [Int]
  }
 
  type Mutation {
    setMessage(message: String): String
    createMessage(input: MessageInput): Message
    updateMessage(id: ID!, input: MessageInput): Message
  }

  type Query {
    addBottonClick(input: ClickInput): ClickRecord
    listBottonClicks: [ClickRecord]
    quoteOfTheDay: String
    random: Float!
    rollThreeDice: [Int]
    rollDice(numDice: Int!, numSides: Int): [Int]
    getDie(numSides: Int): RandomDie
    getMessage(id: ID!): Message
    ip: String
  }
`);

class ClickRecord {
  constructor(id, { color }) {
    const currentdate = new Date();

    this.id = id;
    this.color = color;
    this.clickTime = currentdate.toLocaleString();
  }
}

class RandomDie {
  constructor(numSides) {
    this.numSides = numSides;
  }

  rollOnce() {
    return 1 + Math.floor(Math.random() * this.numSides);
  }

  roll({ numRolls }) {
    var output = [];
    for (var i = 0; i < numRolls; i++) {
      output.push(this.rollOnce());
    }
    return output;
  }
}
// If Message had any complex fields, we'd put them on this object.
class Message {
  constructor(id, { content, author }) {
    this.id = id;
    this.content = content;
    this.author = author;
  }
}

const loggingMiddleware = (req, res, next) => {
  console.log("ip:", req.ip);
  next();
};

const clickDatabase = {};
const fakeDatabase = {};
// The root provides a resolver function for each API endpoint
const root = {
  addBottonClick: ({ input }) => {
    // Create a random id for our "database".
    var id = require("crypto").randomBytes(10).toString("hex");

    const click = new ClickRecord(id, input);
    clickDatabase[id] = click;

    return click;
  },
  listBottonClicks: () => {
    const reult = [];
    for (const key of Object.keys(clickDatabase)) {
      reult.push(clickDatabase[key]);
    }

    return reult.sort((a, b) =>
      Date.parse(a.clickTime) > Date.parse(b.clickTime) ? 1 : -1
    );
  },
  quoteOfTheDay: () => {
    return Math.random() < 0.5 ? "Take it easy" : "Salvation lies within";
  },
  random: () => {
    return Math.random();
  },
  rollThreeDice: () => {
    return [1, 2, 3].map((_) => 1 + Math.floor(Math.random() * 6));
  },
  rollDice: ({ numDice, numSides }) => {
    var output = [];
    for (var i = 0; i < numDice; i++) {
      output.push(1 + Math.floor(Math.random() * (numSides || 6)));
    }
    return output;
  },
  getDie: ({ numSides }) => {
    return new RandomDie(numSides || 6);
  },
  setMessage: ({ message }) => {
    fakeDatabase.message = message;
    return message;
  },
  getMessage: ({ id }) => {
    if (!fakeDatabase[id]) {
      throw new Error("no message exists with id " + id);
    }
    return new Message(id, fakeDatabase[id]);
  },
  createMessage: ({ input }) => {
    // Create a random id for our "database".
    var id = require("crypto").randomBytes(10).toString("hex");

    fakeDatabase[id] = input;
    return new Message(id, input);
  },
  updateMessage: ({ id, input }) => {
    if (!fakeDatabase[id]) {
      throw new Error("no message exists with id " + id);
    }
    // This replaces all old data, but some apps might want partial update.
    fakeDatabase[id] = input;
    return new Message(id, input);
  },
  ip: function (args, request) {
    return request.ip;
  },
};

var app = express();
app.use(cors());
app.use(loggingMiddleware);
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);
app.listen(4000);
console.log("Running a GraphQL API server at localhost:4000/graphql");

/*
{
  addBottonClick(input: { color: "red" }) {
    id
    color
    clickTime
  }
  listBottonClicks {
    id
    color
    clickTime
  }
  quoteOfTheDay
  random
  rollThreeDice
  rollDice(numDice: 3, numSides: 6)
  getDie(numSides: 6) {
    rollOnce
    roll(numRolls: 3)
  }
  getMessage(id: "39b7bd9e7dbe8c7f18ec") {
    id
    content
    author
  }
}


mutation {
  createMessage(input: {author: "andy", content: "hope is a good thing"}) {
    id
    content
    author
  }
}
mutation {
  updateMessage(id: "39b7bd9e7dbe8c7f18ec", input: {author: "andy 2", content: "hope is a good thing too"}) {
    id
    content
    author
  }
}
*/
