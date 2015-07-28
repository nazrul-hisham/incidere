var gulp = require('gulp');

var beautify = require('gulp-beautify');
var paths = {
    scripts: ['partial/*.js', 'viewmodels/*.js'],
    html: 'views/*.html'
};

gulp.task('beautify', function () {
    gulp.src(paths.scripts)
        .pipe(beautify({ indentSize: 2 }))
        .pipe(gulp.dest('./public/'));
});

gulp.task('watch', function () {
    gulp.watch(paths.scripts, ['beautify']);
});

gulp.task('default', ['watch']);