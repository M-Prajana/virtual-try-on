/*import Replicate from "replicate";
import fs from "fs";
import https from "https";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function testFluxVTON() {
  try {
    console.log("Uploading images...\n");

    // Upload person image
    const personFile = await replicate.files.create(
      fs.readFileSync("person.png")
    );

    // Upload cloth image
    const clothFile = await replicate.files.create(
      fs.readFileSync("cloth.png")
    );

    console.log("Images uploaded ✅");

    console.log("\nStarting prediction...\n");

    const output: any = await replicate.run(
      "mmezhov/catvton-flux:cc41d1b963023987ed2ddf26e9264efcc96ee076640115c303f95b0010f6a958",
      {
        input: {
          part: "dresses",

          image: personFile.urls.get,

          garment: clothFile.urls.get,
        },
      }
    );

    console.log("\nPrediction completed ✅");

    console.log("\nRAW OUTPUT:");
    console.log(output);

    let imageUrl = "";

    // CASE 1: output is string
    if (typeof output === "string") {
      imageUrl = output;
    }

    // CASE 2: output is array
    else if (Array.isArray(output)) {
      imageUrl = output[0];
    }

    // CASE 3: output has url() method
    else if ((output as any).url) {
      imageUrl = (output as any).url();
    }

    console.log("\nGenerated Image URL:");
    console.log(imageUrl);

    // Download generated image automatically
    if (imageUrl) {
      const file = fs.createWriteStream("output2.png");

      https.get(imageUrl, (response) => {
        response.pipe(file);

        file.on("finish", () => {
          file.close();

          console.log("\nImage saved as output.png ✅");
        });
      });
    } else {
      console.log("\nNo image URL found ❌");
    }

  } catch (error) {
    console.error("\nERROR ❌");
    console.error(error);
  }
}

testFluxVTON();
*/

import Replicate from "replicate";
import fs from "fs";
import https from "https";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function testCatVTONFlux() {
  try {
    console.log("Uploading person image...\n");

    // Upload your local person image
    const personFile = await replicate.files.create(
      fs.readFileSync("person.png")
    );

    console.log("Image uploaded ✅");

    console.log("\nStarting CATVTON-FLUX prediction...\n");

    const output: any = await replicate.run(
      "mmezhov/catvton-flux:cc41d1b963023987ed2ddf26e9264efcc96ee076640115c303f95b0010f6a958",
      {
        input: {
          try_on: true,

          // Your uploaded person image
          image: personFile.urls.get,

          // Garment image URL
          garment:
            "https://feedback06.wbbasket.ru/vol2274/part227460/227460774/photos/fs.webp",

          num_steps: 16,
        },
      }
    );

    console.log("\nPrediction completed ✅");

    console.log("\nRAW OUTPUT:");
    console.log(output);

    // Usually this model returns array of outputs
    if (Array.isArray(output)) {
      for (const [index, item] of output.entries()) {

        let imageUrl = "";

        // CASE 1: direct string
        if (typeof item === "string") {
          imageUrl = item;
        }

        // CASE 2: object with url()
        else if ((item as any).url) {
          imageUrl = (item as any).url();
        }

        console.log(`\nOutput ${index} URL:`);
        console.log(imageUrl);

        // Download image
        if (imageUrl) {
          const file = fs.createWriteStream(`output_Cat_${index}.png`);

          https.get(imageUrl, (response) => {
            response.pipe(file);

            file.on("finish", () => {
              file.close();

              console.log(
                `Saved as output_Cat_${index}.png ✅`
              );
            });
          });
        }
      }
    } else {
      console.log("\nUnexpected output format ❌");
    }

  } catch (error) {
    console.error("\nERROR ❌");
    console.error(error);
  }
}

testCatVTONFlux();