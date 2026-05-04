import json

def compare(p5CodeFile,predictionFile):
    with open(p5CodeFile, 'r') as file:
        p5Code = json.load(file)
    with open(predictionFile, 'r') as file:
        prediction = json.load(file)
    artinp5code = []
    artinprediction = []
    onlyinp5code = []
    onlyinprediction = []
    for p5file in p5Code:
        artinp5code.append(p5file["artwork"])
    for p5file in prediction:
        artinprediction.append(p5file["artwork"])
    for artname in artinp5code: #check if some files are only in codefile
        if not (artname in artinprediction):
            onlyinp5code.append(artname)
    for artname in artinp5code: #check if some files are only in predictions
        if not (artname in artinp5code):
            onlyinprediction.append(artname)

    print(f"{len(artinp5code)} artworks in {p5CodeFile}")
    print(f"{len(artinprediction)} artworks in {predictionFile}")
    # print(f"{len(onlyinprediction)} artworks are only in {predictionFile}")
    # print(f"{len(onlyinp5code)} artworks are only in {p5CodeFile}")
    glitchesFile=f"./glitches.json"
    glitchesCodePrediction(p5Code,prediction,glitchesFile)

# p5Code and prediction are json dicts
# this function implements different heuristics to identify glitches in the predictions, regarding the content of the code 
def glitchesCodePrediction(p5Code,prediction,glitchesFile):
    audioGlitches=0
    audiopredictions=0
    loadGlitches=0
    loadPredictions=0
    glitches=[]
    for oneprediction in prediction:
        # first check that the same artwork is present both in prediction and p5Code
        p5CodeObject = [obj for obj in p5Code if obj.get('artwork') == oneprediction["artwork"]]
        if not(p5CodeObject is None):
            # if LLM predicted auditory outcome, the code should use some method from p5.sound
            if "auditory" in oneprediction["predicted_labels"]["outcome"]:
                if not("parse error" in p5CodeObject[0]["p5functions"]):
                    if not("p5.sound" in p5CodeObject[0]["p5modules"]):
                        glitches.append({
                            "artwork":oneprediction["artwork"],
                            "glitch":"audio prediction",
                            "predicted_labels": oneprediction["predicted_labels"],
                            "p5_functions":p5CodeObject[0]["p5functions"],
                            "p5_modules":p5CodeObject[0]["p5modules"]
                        })
                        audioGlitches+=1
                audiopredictions+=1
            # if LLM predicted entities processed_audio/image/text, the code should use one of the following functions: load, loadImage, loadSound
            if ("processed_audio" in oneprediction["predicted_labels"]["entities"]) or "processed_image" in oneprediction["predicted_labels"]["entities"]or "processed_text" in oneprediction["predicted_labels"]["entities"]:
                if not("parse error" in p5CodeObject[0]["p5functions"]):
                    if not(("load" in p5CodeObject[0]["p5functions"]) or ("createImg" in p5CodeObject[0]["p5functions"]) or ("loadStrings" in p5CodeObject[0]["p5functions"]) or ("loadJSON" in p5CodeObject[0]["p5functions"]) or ("loadImage" in p5CodeObject[0]["p5functions"]) or ("loadSound" in p5CodeObject[0]["p5functions"]) or ("loadPixels" in p5CodeObject[0]["p5functions"]) or ("loadFile" in p5CodeObject[0]["p5functions"])):
                        glitches.append({
                            "artwork":oneprediction["artwork"],
                            "glitch":"processed prediction",
                            "predicted_labels": oneprediction["predicted_labels"],
                            "p5_functions":p5CodeObject[0]["p5functions"],
                            "p5_modules":p5CodeObject[0]["p5modules"]
                        })
                        loadGlitches+=1
                loadPredictions+=1
    print(f"found {loadGlitches} glitches in processed entity prediction, out of {loadPredictions}")
    print(f"found {audioGlitches} glitches in audio outcome prediction, out of {audiopredictions}")
    with open(glitchesFile, 'w') as json_file:
        json.dump(glitches, json_file)

def main():
    compare("p5AndModulesInLotsOfArtworks.json","predictions-19Kartworks-rq3.json")    

if __name__ == "__main__":
    main()
