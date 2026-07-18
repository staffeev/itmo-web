import express from "express";
import cors from "cors";
import busboy from "busboy";
import zlib from "zlib";

const app = express();
app.use(cors());

app.get("/login", (_, res) => {
  res.type("text/plain").send("staffeev409626");
});

function gzip(data) {
  return zlib.gzipSync(data);
}

app.post("/zipper", (req, res) => {
  const bb = busboy({ headers: req.headers });
  let buffer = Buffer.alloc(0);
  bb.on("file", (_, file) => {
    file.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
    });
  });
  bb.on("field", (_, value) => {
    buffer = Buffer.from(value);
  });
  bb.on("close", () => {
    const result = gzip(buffer);
    res.setHeader("Content-Type", "application/gzip");
    res.end(result);
  });
  req.pipe(bb);
});

const PORT = process.env.PORT;
app.listen(PORT);