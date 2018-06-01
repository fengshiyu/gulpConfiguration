var gulp = require("gulp");
// 将scss文件转为css文件
var sass = require("gulp-sass");
// 代理
var browserSync = require("browser-sync");
// 压缩图片
var imagemin = require("gulp-imagemin");

var cache = require('gulp-cache');

// 删除文件或文件夹
var del = require("del");

// 运行序列
var runSequence = require('run-sequence');

var babel = require("gulp-babel");

var useref = require("gulp-useref");

// 使用 JS 插件来转换 CSS 的工具
var postcss = require("gulp-postcss");

// 浏览器前缀--相当于Sass、Less
var autoprefixer = require("autoprefixer");

// 模版
var fileinclude = require('gulp-file-include');

// 将scss文件转换为css文件
gulp.task("sass",function(){
	var processors = [ 
		autoprefixer({
			browsers: ["> 5%", "Android >= 4.0"],
			cascade: true,
			remove:true
		})
	];
	return gulp.src("dev/scss/**/*.scss")
	.pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
	.pipe(postcss(processors))
	.pipe(gulp.dest("dev/css"))
	.pipe(browserSync.reload({
		stream:true
	}))
})

//  模版--引head、bottom
gulp.task('fileinclude', function() {
    gulp.src('./dev/viewsInclude/*.html')//主文件
        .pipe(fileinclude({
            prefix: '@@',//变量前缀 @@include
            basepath: './dev/public/',//引用文件路径
            indent:true//保留文件的缩进
        }))
        .pipe(gulp.dest('./dev/'));//输出文件路径
});

// 代理
gulp.task("browserSync",function(){
	browserSync({
		server:{
			baseDir:"dev",
			index:"index.html"
		},
		port:6681
	})
})

// build task
gulp.task("fonts", function() {
  return gulp.src("dev/fonts/**/*")
    .pipe(gulp.dest("dist/fonts"))
})

// build task
gulp.task("css", function() {
  return gulp.src("dev/css/**/*.css")
    .pipe(gulp.dest("dist/css"))
})

// 压缩图片
gulp.task("images",function(){
	return gulp.src("dev/images/**/*.+(png|jpg|jpeg|gif|svg)")
	.pipe(cache(imagemin({
		interlaced:true
	})))
	.pipe(gulp.dest("dist/images"))
})

// build task
gulp.task("convertJS",function(){
	return gulp.src("dev/js/**/*.js")
	.pipe(babel({
		presets:["es2015"]
	}))
	.pipe(gulp.dest("dist/js"))
})

// build task
gulp.task('useref', function() {
  return gulp.src("dev/*.html")
    .pipe(useref())
    .pipe(gulp.dest("dist"));
});

// gulp.task("clean",function(callback){
// 	del("dist");
// 	return cache.clearAll(callback);
// })

gulp.task("watch",["fileinclude","browserSync","sass"],function(){
	gulp.watch("dev/scss/**/*.scss",["sass"]);
	gulp.watch("dev/viewsInclude/*.html",["fileinclude"]);
	gulp.watch("dev/public/*.html",["fileinclude"]);
	gulp.watch("dev/*.html",browserSync.reload);
	gulp.watch("dev/js/**/*.js",browserSync.reload);
})

gulp.task("clean:dist",function(callback){
	del(["dist/**/*","!dist/images","!dist/images/**/*"],callback)
})

// production -task
gulp.task("build",function(callback){
	runSequence(["clean:dist","sass","useref","images","fonts","convertJS","css"],callback)
})

// dev -task
gulp.task("dev",function(callback){
	runSequence(["sass","browserSync","watch"],callback)
})