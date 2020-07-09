import * as fs from 'fs';
import * as path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as babel from '@babel/core';

const NORMAL_MODULE = '-1';

interface GraphStruct {
    context: string;
    moduleId: string;
}

interface ChildType {
    type: string;
    path: string;
    chunkId: string;
}

class TinyWebpack {
    private entryPath: string
    private graph: GraphStruct[]
    private chunks: Object
    private chunksId: number
    constructor(entryPath: string) {
        this.entryPath = entryPath;
        this.graph = [];
        this.chunks = {};
        this.chunksId = 0;
        this.init();
    }
    init() {
        this.createGraph(this.entryPath, this.entryPath, NORMAL_MODULE);
        const chunksModules = this.bundlechunk(this.chunks);
        fs.writeFileSync('bundle.js', this.bundle(this.graph));

        chunksModules.forEach(item => {
            fs.writeFileSync(`${item.id}_chunk.js`, item.context);
        })

    }
    parserDep(context: string, chunkId: string) {
        const ast = parse(context, {
            sourceType: 'module'
        });
        const childrens: ChildType[] = [];
        const _this = this;
        traverse(ast, {
            ImportDeclaration: ({ node }) => {
                childrens.push({
                    type: 'module',
                    path: node.source.value,
                    chunkId
                });
            },
            CallExpression: ({ node }) => {
                if (node.callee.name === 'require') {
                    childrens.push({
                        type: 'module',
                        path: node.arguments[0].value,
                        chunkId
                    });
                }
                if (node.callee.type === 'Import') {
                    childrens.push({
                        type: 'chunk',
                        path: node.arguments[0].value,
                        chunkId: node.arguments[0].value,
                    });
                    _this.chunks[node.arguments[0].value] = {
                        id: _this.chunksId,
                        context: '',
                        graph: []
                    }
                    _this.chunksId++;
                }
            }
        })

        console.log(childrens);
        console.log(this.chunks);
        return childrens;
    }
    transform(context: string) {
        const _this = this;
        let visitor = {
            CallExpression(nodePath: any) {
                console.log(nodePath.node.callee.type);
                if (nodePath.node.callee.type === 'Import') {
                    const relyPath = nodePath.node.arguments[0].value;
                    const chunkId = _this.chunks[relyPath].id;
                    nodePath.replaceWithSourceString(`require.e(/* import() */ ${chunkId}).then(require.bind(null, "${relyPath}"))`);
                }
            }
          }
        const result = babel.transform(context, {
            plugins: [
                { visitor },
            ],
            presets: ["@babel/preset-env"]
        });
        console.log(result.code);
        return result.code;
    }
    createGraph(rootPath: string, relativePath: string, chunkId: string) {
        const context = fs.readFileSync(rootPath, 'utf-8');
        const childrens = this.parserDep(context, NORMAL_MODULE);
        if (chunkId === NORMAL_MODULE) {
            this.graph.push({
                context: this.transform(context),
                moduleId: relativePath,
            })  
        } else {
            this.chunks[chunkId].graph.push({
                context: this.transform(context),
                moduleId: relativePath,
            })  
        }
        
        const dirname = path.dirname(rootPath);
        if (childrens.length > 0) {
            childrens.forEach(child => {
                if (child.type === 'module') {
                    this.createGraph(path.join(dirname, child.path), child.path, NORMAL_MODULE);
                } else {
                    this.createGraph(path.join(dirname, child.path), child.path, child.chunkId);
                }
            });
        }
    }
    bundlechunk(chunks) {
        return Object.keys(chunks).map((item) => {
            const chunkItem = chunks[item];
            let modules = '';
            chunkItem.graph.forEach(module => {
                modules += `"${module.moduleId}":function (module, exports, require){
                ${module.context}
                },`;
            });
            const bundleOutput = `
                (window["webpackJsonp"] = window["webpackJsonp"] || []).push([[${chunkItem.id}],{
                   ${modules}
                }]);
            `;
            return {
                id: chunkItem.id,
                context: bundleOutput,
            };
        })
    }
    bundle(graph: GraphStruct[]) {
        let modules = '';
        graph.forEach(module => {
            modules += `"${module.moduleId}":function (module, exports, require){
            ${module.context}
            },`;
        });
        const bundleOutput = `
        (function(modules) {
            // webpackBootstrap
            function webpackJsonpCallback(data) {
                var chunkIds = data[0];
                var moreModules = data[1];
       
       
                // add "moreModules" to the modules object,
                // then flag all "chunkIds" as loaded and fire callback
                var moduleId, chunkId, i = 0, resolves = [];
                for(;i < chunkIds.length; i++) {
                    chunkId = chunkIds[i];
                    if(Object.prototype.hasOwnProperty.call(installedChunks, chunkId) && installedChunks[chunkId]) {
                        resolves.push(installedChunks[chunkId][0]);
                    }
                    installedChunks[chunkId] = 0;
                }
                for(moduleId in moreModules) {
                    if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
                        modules[moduleId] = moreModules[moduleId];
                    }
                }
       
                while(resolves.length) {
                    resolves.shift()();
                }
       
            };
            // The module cache
            var installedModules = {};

            var installedChunks = {};
        
            // The require function
            function require(moduleId) {
                // Check if module is in cache
                if (installedModules[moduleId]) {
                    return installedModules[moduleId].exports;
                }
                // Create a new module (and put it into the cache)
                var module = (installedModules[moduleId] = {
                    i: moduleId,
                    l: false,
                    exports: {},
                });
            
                // Execute the module function
                modules[moduleId].call(
                    module.exports,
                    module,
                    module.exports,
                    require
                );
            
                // Flag the module as loaded
                module.l = true;
            
                // Return the exports of the module
                return module.exports;
            }
            function jsonpScriptSrc(chunkId) {
                return \`\${chunkId}_chunk.js\`;
            }
            require.e = function requireEnsure(chunkId) {
                var promises = [];
       
       
                // JSONP chunk loading for javascript
       
                var installedChunkData = installedChunks[chunkId];
                if(installedChunkData !== 0) { // 0 means "already installed".
       
                    // a Promise means "currently loading".
                    if(installedChunkData) {
                        promises.push(installedChunkData[2]);
                    } else {
                        // setup Promise in chunk cache
                        var promise = new Promise(function(resolve, reject) {
                            installedChunkData = installedChunks[chunkId] = [resolve, reject];
                        });
                        promises.push(installedChunkData[2] = promise);
       
                        // start chunk loading
                        var script = document.createElement('script');
                        var onScriptComplete;
       
                        script.charset = 'utf-8';
                        script.timeout = 120;
                        script.src = jsonpScriptSrc(chunkId);
       
                        // create error before stack unwound to get useful stacktrace later
                        var error = new Error();
                        onScriptComplete = function (event) {
                            // avoid mem leaks in IE.
                            script.onerror = script.onload = null;
                            clearTimeout(timeout);
                            var chunk = installedChunks[chunkId];
                            if(chunk !== 0) {
                                if(chunk) {
                                    var errorType = event && (event.type === 'load' ? 'missing' : event.type);
                                    var realSrc = event && event.target && event.target.src;
                                    error.message = 'Loading chunk ' + chunkId + ' failed.\\n(' + errorType + ': ' + realSrc + ')';
                                    error.name = 'ChunkLoadError';
                                    error.type = errorType;
                                    error.request = realSrc;
                                    chunk[1](error);
                                }
                                installedChunks[chunkId] = undefined;
                            }
                        };
                        var timeout = setTimeout(function(){
                            onScriptComplete({ type: 'timeout', target: script });
                        }, 120000);
                        script.onerror = script.onload = onScriptComplete;
                        document.head.appendChild(script);
                    }
                }
                return Promise.all(promises);
            };
            var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
            jsonpArray.push = webpackJsonpCallback;
            require("${graph[0].moduleId}");
        })({${modules}})
        `;
        return bundleOutput;
    }
}

new TinyWebpack('./example/index.js');