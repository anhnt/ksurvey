var FILE_DB_NAME = 'filesDB';
var FILE_DB_TITLE = 'Files DB';

function getFilesDB(page) {
    var jsonDB = page.find('/jsondb');
    var filesDB = jsonDB.find(FILE_DB_NAME);

    if (isNull(filesDB)) {
        filesDB = jsonDB.createDb(FILE_DB_NAME, FILE_DB_TITLE, FILE_DB_NAME);
    }

    if (!filesDB.allowAccess) {
        setAllowAccess(filesDB, true);
    }

    return filesDB;
}

function uploadFile(page, params, files) {
    log.info('uploadFile > page {} params {} files {}', page, params, files);

    var filesDB = getFilesDB(page);

    if (files !== null || !files.isEmpty()) {
        var filesArray = files.entrySet().toArray();

        for (var i = 0; i < filesArray.length; i++) {
            var file = filesArray[i].getValue();
            var fileHash = fileManager.uploadFile(file);
            var fileJson = {
                fileName: fileHash,
                type: file.contentType,
                size: file.size,
                uploaded: new Date(),
                hash: fileHash
            };

            log.info("File json {}", JSON.stringify(fileJson));

            var checkExisting = filesDB.child(fileHash);

            if (checkExisting !== null) {
                var errorJson = checkExisting.jsonObject;
                errorJson.warn = true;
                errorJson.message = "File already exists";

                return views.jsonObjectView(errorJson);
            }

            filesDB.createNew(fileHash, JSON.stringify(fileJson), 'file');
            return views.jsonObjectView(fileJson);
        }
    }
}

function getFile(page, params) {
    log.info("getFile > page {} params {}", page, params);

    var filesDB = getFilesDB(page);
    var fileName = page.attributes.fileName;

    if (filesDB === null) {
        log.info("FileDB is null");
        page.throwNotFound("File " + fileName + " not found");
    }

    var fileRecord = filesDB.child(fileName);
    if (fileRecord === null) {
        page.throwNotFound("File " + fileName + " not found");
    }

    var json = fileRecord.jsonObject;

    return views.fileView(json.hash, json.type);
}

function deleteAdminFile(page) {
    log.info("deleteAdminFile > page {}", page);

    var filesDB = getFilesDB(page);
    var fileName = page.attributes.fileName;

    if (filesDB === null) {
        log.info("FileDB is null");
        page.throwNotFound("File " + fileName + " not found");
    }

    var fileRecord = filesDB.child(fileName);
    if (fileRecord === null) {
        page.throwNotFound("File " + fileName + " not found");
    }
    
    fileRecord.delete();
}
