import { Builder, By, WebDriver, } from 'selenium-webdriver';
import { NotFoundError } from "./errors/Errors";
import path from 'path';
import { saveFile, readFileOfBarCodes } from './fileUtils';


const BASEURL = "https://cosmos.bluesoft.com.br/produtos"

/**
 * Opens a firefox page
 */
async function createDriver(initialPage = BASEURL) {
    let driver = await new Builder()
        .forBrowser('firefox')
        .build();
    try {
        await driver.get(initialPage);
    }catch (e) {
        console.error(e);
    }

    return driver;
}

interface openPageParams {
    driver: WebDriver;
    productBarCode: string;
    baseUrl?: string;
}

type openPageResponse = Promise<
    {
        barcode: string;
        NCM: string;
    }
    | null
>;

async function openPageAndGetNCM({ driver, productBarCode, baseUrl = BASEURL }: openPageParams): openPageResponse{
    try {
        await driver.get(`${baseUrl}/${productBarCode}`);

        // element that holds info of product's NCM
        let element = ".product-header-attributes > li:nth-child(1) > span:nth-child(1) > a:nth-child(1)";
        let productDescription;
        try {
            productDescription = await driver.findElement(
                By.css(element)
            );
        } catch (error) {
            // if element not found
            if (!productDescription) {
                throw new NotFoundError(element);
            }
        }


        // parse text
        const text = await productDescription.getAttribute("text");
        const NCM = text.split(" ")[0];

        return {
            barcode: productBarCode,
            NCM: NCM
        };


    } catch (error) {
        console.error(error);
    }

    return null;
}

(async function main() {
    const driver = await createDriver();

    const fetchBarCodes =
        async (listOfBarCodes: string[] | null): Promise<void> => {
            if (listOfBarCodes) {
                let response = "";
                for (const barcode of listOfBarCodes) {
                    const bar_ncm = await openPageAndGetNCM({ driver, productBarCode: barcode });
                    response += (`${bar_ncm?.barcode} => ${bar_ncm?.NCM}\n`);
                }

                saveFile(path.resolve(__dirname, "..", "NCM.txt"), response);
                driver.quit();
            }
        };

    readFileOfBarCodes(
        path.resolve(__dirname, '..', 'codigo de barras.txt'),
        fetchBarCodes
    );

})();