import typescript from 'rollup-plugin-typescript';
export default {
	entry: 'src/promise.js',
	dest: 'dest/promise.js',
	moduleName: 'HERE',
	format: 'umd',
	plugins:[
		typescript()
	]
};
