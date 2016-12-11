/*
The MIT License(MIT)
Copyright(c) mxgmn 2016.
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
The software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.
*/

const fs = require('fs'),
      xmldoc = require('xmldoc'),
      OverlappingModel = _ => true,
      SimpleTiledModel = _ => true;

function main(xdoc) {
  let random = Math.random(),
      counter = 1,
      models = [];


  xdoc.eachChild(xnode => {
    let name = xnode.name,
        model;
    if (name == "overlapping") {
      console.log(name, xnode.attr['width'] || 48)
      
      model = OverlappingModel(
        name,
        xnode.attr['N'] || 2,
        xnode.attr['width'] || 48,
        xnode.attr['height'] || 48,
        xnode.attr['periodicInput'] || true,
        xnode.attr['periodic'] || false,
        xnode.attr['symmetry'] || 8,
        xnode.attr['ground'] || 0
      );
      
    } else if (xnode.Name == "simpletiled") {
      model = SimpleTiledModel(
        name,
        xnode.attr["subset"], 
	xnode.attr["width"] || 10,
        xnode.attr["height"] || 10,
        xnode.attr["periodic"] || false,
        xnode.attr["black"] || false
      );
    } else {
      return;
    }
    
  });
  
  /*
  foreach (XmlNode xnode in xdoc.FirstChild.ChildNodes)
  {
    if (xnode.Name == "#comment") continue;

    Model model;
    string name = xnode.Get<string>("name");
    Console.WriteLine($"< {name}");

    if (xnode.Name == "overlapping") model = new OverlappingModel(name, xnode.Get("N", 2), xnode.Get("width", 48), xnode.Get("height", 48), 
				                                  xnode.Get("periodicInput", true), xnode.Get("periodic", false), xnode.Get("symmetry", 8), xnode.Get("ground", 0));
    else if (xnode.Name == "simpletiled") model = new SimpleTiledModel(name, xnode.Get<string>("subset"), 
				                                       xnode.Get("width", 10), xnode.Get("height", 10), xnode.Get("periodic", false), xnode.Get("black", false));
    else continue;

    for (int i = 0; i < xnode.Get("screenshots", 2); i++)
      {
	for (int k = 0; k < 10; k++)
	  {
	    Console.Write("> ");
	    int seed = random.Next();
	    bool finished = model.Run(seed, xnode.Get("limit", 0));
	    if (finished)
	      {
		Console.WriteLine("DONE");

		model.Graphics().Save($"{counter} {name} {i}.png");
		if (model is SimpleTiledModel && xnode.Get("textOutput", false))
		  System.IO.File.WriteAllText($"{counter} {name} {i}.txt", (model as SimpleTiledModel).TextOutput());

		break;
	      }
	    else Console.WriteLine("CONTRADICTION");
	  }
      }

    counter++;
  }
  */
}

const contents = fs.readFileSync('../samples.xml').toString();
console.log(contents)
main(new xmldoc.XmlDocument(contents));
