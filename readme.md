Analyze p5 sketches to determine which parts of the p5 API they use as indicators of the generative artwork's intention.

Reads all files place in the artworks folder. For each file, determines which of the p5 functions it uses. The list of p5 methods is fetched from the list of method items declared at this [p5 endpoint](https://p5js.org/reference/data.json).

Generates a p5InArtworks.json output, which includes one JSON object per input artwork file. Each JSON object is of the following form
```
{
    "name":"name-of-input-file",
    "p5functions":[
       {
            "name": "p5-function-name-used-in-input-file",
            "id": "unique-integer-id-for-the-function"
       } 
    ]
}
```