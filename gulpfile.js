var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var cleanCSS = require('gulp-clean-css');
// 串行执行任务
var gulpSequence  = require('gulp-sequence');
// 头部注释
var header = require('gulp-header');
var pkg = require('./package.json');
var banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @author <%= pkg.homepage %>',
  ' */',
  ''].join('\n');


var debugPath = './dist/_debug/';
var releasePath = './dist/';


// 下拉刷新核心文件合并
gulp.task('core_concat', function() {
	return gulp.src(['./src/core/pulltorefresh.iscroll.probe.js', './src/core/pulltorefresh.js', './src/core/pulltorefresh.core.js'])
		.pipe(concat('pulltorefresh.core.js'))
		.pipe(gulp.dest(debugPath));
});


// 打包skin-defult
gulp.task('pack_skin_default', ['core_concat'], function() {
    return gulp.src([debugPath + 'pulltorefresh.core.js', './src/pulltorefresh.skin.default.js'])
        .pipe(concat('pulltorefresh.skin.default.js'))
        .pipe(gulp.dest(debugPath));
});

// 打包skin-type1
gulp.task('pack_skin_type1', ['core_concat'], function() {
    return gulp.src([debugPath + 'pulltorefresh.core.js', './src/pulltorefresh.skin.type1.js'])
        .pipe(concat('pulltorefresh.skin.type1.js'))
        .pipe(gulp.dest(debugPath));
});

// 打包skin-type2
gulp.task('pack_skin_type2', ['core_concat'], function() {
    return gulp.src([debugPath + 'pulltorefresh.core.js', './src/pulltorefresh.skin.type2.js'])
        .pipe(concat('pulltorefresh.skin.type2.js'))
        .pipe(gulp.dest(debugPath));
});

// 打包skin-type3
gulp.task('pack_skin_type3', ['core_concat'], function() {
    return gulp.src([debugPath + 'pulltorefresh.core.js', './src/pulltorefresh.skin.type3.js'])
        .pipe(concat('pulltorefresh.skin.type3.js'))
        .pipe(gulp.dest(debugPath));
});

// 打包skin-type4
gulp.task('pack_skin_type4', ['core_concat'], function() {
    return gulp.src([debugPath + 'pulltorefresh.core.js', './src/pulltorefresh.skin.type4.js'])
        .pipe(concat('pulltorefresh.skin.type4.js'))
        .pipe(gulp.dest(debugPath));
});

// 打包skin-type5
gulp.task('pack_skin_type5', ['core_concat'], function() {
    return gulp.src([debugPath + 'pulltorefresh.core.js', './src/pulltorefresh.skin.type5.js'])
        .pipe(concat('pulltorefresh.skin.type5.js'))
        .pipe(gulp.dest(debugPath));
});

// 打包skin-native
gulp.task('pack_skin_native', function() {
    return gulp.src(['./src/pulltorefresh.skin.native.js'])
        .pipe(concat('pulltorefresh.skin.native.js'))
        .pipe(gulp.dest(debugPath));
});

// 打包bizlogic-impl
gulp.task('pack_bizlogic_impl', function() {
    return gulp.src(['./src/core/handedata.js', './src/pulltorefresh.bizlogic.impl.js'])
        .pipe(concat('pulltorefresh.bizlogic.impl.js'))
        .pipe(gulp.dest(debugPath));
});

// 打包bizlogic-impl
gulp.task('pack_bizlogic_impl2', function() {
    return gulp.src(['./src/core/handedata.js', './src/pulltorefresh.bizlogic.impl2.js'])
        .pipe(concat('pulltorefresh.bizlogic.impl2.js'))
        .pipe(gulp.dest(debugPath));
});


// 打包 css以及静态资源
gulp.task('pack_resources', function() {
    return gulp.src(['./src/css/**/*'])
        .pipe(gulp.dest(debugPath + 'css/'));
});


// 压缩发布的源文件
gulp.task('js_uglify', function() {
    return gulp.src([debugPath + '**/*.js', '!'+ debugPath + '**/*.min.js'])
        .pipe(uglify())
        // 压缩时进行异常捕获
        .on('error', function(err) {
            console.log('line number: %d, message: %s', err.lineNumber, err.message);
            this.end();
        })
//      .pipe(rename({
//          suffix: '.min'
//      }))
        .pipe(header(banner, { pkg : pkg } ))
        .pipe(gulp.dest(releasePath));
});

// 压缩发布 css
gulp.task('clean_css', function() {
	return gulp.src([debugPath + '**/*.css', '!'+ debugPath + '**/*.min.css'])
		.pipe(cleanCSS())
//      .pipe(rename({
//          suffix: '.min'
//      }))
    .pipe(header(banner, { pkg : pkg } ))
		.pipe(gulp.dest(releasePath));
});

// 压缩发布 图片资源,暂时不压缩
gulp.task('resource_uglify', function() {
    return gulp.src([debugPath + '**/*', '!'+ debugPath + '**/*.css', '!'+ debugPath + '**/*.js'])
        .pipe(gulp.dest(releasePath));
});

gulp.task('pack_debug', ['pack_skin_default', 'pack_skin_type1', 'pack_skin_type2', 'pack_skin_type3', 'pack_skin_type4', 'pack_skin_type5', 'pack_skin_native', 'pack_bizlogic_impl', 'pack_bizlogic_impl2', 'pack_resources']);


gulp.task('pack_release', ['js_uglify', 'clean_css', 'resource_uglify']);


gulp.task('default', gulpSequence('pack_debug', 'pack_release'));

// 看守
gulp.task('watch', function() {

    // 看守所有位在 dist/  目录下的档案，一旦有更动，便进行重整
    //  gulp.watch([config.src+'/gulpWatch.json']).on('change', function(file) {
    //      console.log("改动");
    //  });
    gulp.watch('./src/**/*', ['default']);

});