import fs from 'fs';

export function readFileOfBarCodes(
    filePath: string,
    cb: (param: string[] | null) => void): void {

    fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) {
            console.error(err);
            cb(null);
            return;
        }

        cb(data.split("\n").map(barcode => barcode.trim()));
        return;
    });
}
export function saveFile(filePath: string, stringToSave: string, cb = () => { }): void {

    fs.writeFile(filePath, stringToSave, cb);
}
