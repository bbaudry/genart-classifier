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
    checkAuditory(p5Code,prediction)


    print(f"{len(artinp5code)} artworks in {p5CodeFile}")
    print(f"{len(artinprediction)} artworks in {predictionFile}")
    print(f"{len(onlyinprediction)} artworks are only in {predictionFile}")
    print(f"{len(onlyinp5code)} artworks are only in {p5CodeFile}")

# p5Code and prediction are json dicts
# check that files predicted with auditory outcome use p5.Sound
def checkAuditory(p5Code,prediction):
    for oneprediction in prediction:
        if "auditory" in oneprediction["predicted_labels"]["outcome"]:
            if any(onep5["artwork"]==oneprediction["artwork"] for onep5 in p5Code):
                p5CodeObject = [obj for obj in p5Code if obj.get('artwork') == oneprediction["artwork"]]
                print(f"it is possible to get the p5 classes for {p5CodeObject["p5modules"]}")

    

def main():
    compare("p5AndModulesInLotsOfArtworks.json","predictions-19Kartworks-rq3.json")    

if __name__ == "__main__":
    main()
