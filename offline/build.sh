#!/bin/bash

for post in `ls ../jobs/_posts/*.md`; do
    filename=$(basename $post)
    out="${filename%.*}.pdf"
    pandoc $post -o $out --template jobposting.tex
done