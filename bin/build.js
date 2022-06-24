"use strict"

const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

const folderSrc = path.resolve(__dirname, '../web');
const folderDst = path.resolve(__dirname, '../docs');
const folderDel = path.resolve(__dirname, '../docs_del');

const compression = 0;
// 0 = none
// 1 = fast (gzip)
// 2 = thorough (zopfli)
const embed = true;

if (fs.existsSync(folderDst)) {
	deleteFolder(folderDel);
	renameFolder(folderDst, folderDel);
}

createFolder(folderDst);
scanFolder(folderSrc, folderDst);



function createFolder(folder) {
	fs.mkdirSync(folder, {recursive:true});
}

function renameFolder(folderOld, folderNew) {
	if (fs.existsSync(folderNew)) throw Error('Can\'t rename "'+folderOld+'", because "'+folderNew+'" already exists.')
	fs.renameSync(folderOld, folderNew);
}

function deleteFolder(folder) {
	if (fs.existsSync(folder)) fs.rmdirSync(folder, {recursive:true});
}

function scanFolder(src, dst) {
	// this function is run recursively

	fs.readdirSync(src).forEach(entry => {
		// check every entry in the src folder

		let filenameSrc = path.resolve(src, entry);
		let filenameDst = path.resolve(dst, entry);

		if (fs.statSync(filenameSrc).isDirectory()) {
			// entry is a directory
			scanFolder(filenameSrc, filenameDst);
		} else {
			// entry is a file
			let ext = filenameSrc.split('.').pop();
			switch (ext) {
				// ignored files
				case 'DS_Store':
					return;
				break;

				// copy + compressed
				case 'bin':
				case 'css':
				case 'eot':
				case 'glsl':
				case 'jpg':
				case 'js':
				case 'json':
				case 'map':
				case 'png':
				case 'svg':
				case 'woff':
				case 'woff2':
					console.log(path.relative(folderSrc, filenameSrc));
					ensureFolder(dst);
					copyFile(filenameSrc, filenameDst);
					compressFile(filenameDst);
				break;

				case 'html':
					ensureFolder(dst);
					compactHTMLFile(filenameSrc, filenameDst);
					compressFile(filenameDst);
				break;

				default: throw new Error('Unknown file extension "'+ext+'"');
			}
		}
	})
}

function copyFile(src, dst) {
	fs.writeFileSync(dst, fs.readFileSync(src));
}

function compressFile(filename) {
	switch (compression) {
		case 0: return;
		case 1: return child_process.spawnSync('gzip', ['-k', filename]);
		case 2: child_process.spawnSync('zopfli', ['--gzip', '--i15', filename]);
	}
}

function ensureFolder(folder) {
	if (fs.existsSync(folder)) return;
	ensureFolder(path.dirname(folder));
	fs.mkdirSync(folder);
}

function compactHTMLFile(src, dst) {
	let html = fs.readFileSync(src, 'utf8');

	if (embed) {
		html = html.replace(/\s*\n\s*/g,'\n');

		html = html.replace(/<script.*?src=".*?".*?<\/script>/gi, embedJavaScript);
	}

	fs.writeFileSync(dst, html, 'utf8');

	function embedJavaScript(html) {
		let link = html.match(/src=\"(.*?)\"/i);
		if (!link) return html;

		link = path.resolve(path.dirname(src), link[1]);
		let uglify = child_process.spawnSync('uglifyjs', [link]);
		if (uglify.error) {
			console.log('maybe run "npm install uglify-js -g"')
			console.log(uglify);
			throw uglify.error;
		}
		uglify = uglify.stdout.toString();
		return '<script type="text/javascript">/*<![CDATA[*/'+uglify+'/*]]>*/</script>';
	}
}



