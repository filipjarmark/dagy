const path = require('path');
const gulp = require('gulp');
const nunjucks = require('gulp-nunjucks-render');
const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();
const runSequence = require('run-sequence');



gulp.task('serve', () => {
	browserSync.init({
		notify: false,
		ghostMode: false,
		server: {
			baseDir: ['build']
		},
		middleware(req, res, next) {
			if (req.url !== '/' && !path.extname(req.url))
				req.url += '.html';

			next();
		}
	});
});


gulp.task('watch', () => {
	gulp.watch('src/styles/**/*', ['styles', browserSync.reload]);
	gulp.watch(['src/pages/**/*', 'src/templates/**/*'], ['pages', browserSync.reload]);
	gulp.watch([
		'src/images/**/*',
		'src/assets/**/*',
		'src/scripts/**/*'
	], ['files', browserSync.reload]);

	gulp.watch('src/images/**', browserSync.reload);
});


gulp.task('styles', () => {
	return gulp.src('src/styles/**/*.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest('build/styles'));
});


gulp.task('pages', () => {
	return gulp.src('src/pages/**/*')
		.pipe(nunjucks({
			path: ['src/pages', 'src/templates']
		}).on('error', () => {}))
		.pipe(gulp.dest('build/'));
});


gulp.task('files', () => {
	return gulp.src([
		'src/images/**/*',
		'src/assets/**/*',
		'src/scripts/**/*'
	], {
		base: 'src'
	}).pipe(gulp.dest('build'));
});


gulp.task('dev', (cb) => {
	runSequence([
		'build',
		'watch',
		'serve'
	], cb);
});


gulp.task('build', (cb) => {
	runSequence([
		'styles',
		'pages',
		'files'
	], cb);
});
