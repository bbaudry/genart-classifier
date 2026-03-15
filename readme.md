Analyze p5 sketches to determine which parts of the p5 API they use as indicators of the generative artwork's intention. Builds one vector for each artwork and computes the embedding for this set of vectors. 

index.js
--

Reads all files place in the artworks folder. For each file, determines which of the p5 functions it uses. The list of p5 methods is fetched from the list of method items declared at this [p5 endpoint](https://p5js.org/reference/data.json).

Generates three outputs
- p5InArtworks.json: includes one JSON object per input artwork file. Each JSON object is of the following form
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

- p5VectorsArtworks.json: includes one JSON object per input artwork file. Each JSON object is of the following form. In this file, the size of the p5functions is the same for each artwork, hence amenable to dimensionality reduction
```
{
    "name":"name-of-input-file",
    "p5functions":[
       {
            "name": number-invocations-in-input-file
       } 
    ]
}
```
- artworksEmbedding.json: includes two arrays, an array of [x,y] coordinates that correspond to the embedding in a 2D space and an array of labels
```
{
    "embedding":[
        [x1,y1],
        [x2,y2]
    ],
    "labels":[
        label1,
        label2
    ]
}
```
embedding.html
--

Generates a plot for artworksEmbedding.json

