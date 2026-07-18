export default (express, bodyParser, createReadStream, crypto, http) => {
    let app = express();
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use((req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "*");
        res.setHeader(
            "Access-Control-Allow-Headers",
            "Access-Control-Allow-Headers, Content-Type, x-author, ngrok-skip-browser-warning"
        );
        if (!req.path.endsWith("/")) {
            let query = req.url.includes("?") ? req.url.substring(req.url.indexOf("?")) : "";
            return res.redirect(301, req.path + "/" + query);
        }
        next();
    });

    app.get("/login/", (req, res) => {res.send("staffeev409626");});
    app.get("/code/", (req, res) => {createReadStream(import.meta.url.substring(7)).pipe(res);});
    app.get("/sha1/:input/", (req, res) => {
        let hash = crypto.createHash("sha1").update(req.params.input).digest("hex");
        res.send(hash);
    });

    let reqHandler = (req, res) => {
        let addr = (req.method === "POST") ? req.body.addr : req.query.addr;

        http.get(addr, response => {
            let data = "";
            response.on("data", chunk => {data += chunk;});
            response.on("end", () => {res.send(data);});
        });
    };
    app.get("/req/", reqHandler);
    app.post("/req/", reqHandler);

    app.all("*", (req, res) => {res.send("staffeev409626");});
    return app;
};