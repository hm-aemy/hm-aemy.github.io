


Jekyll::Hooks.register :posts, :post_write do |post|
    # code to call after Jekyll renders a page
       
    if post.data["layout"] == "job"
        qrcode = post.site.config["url"] + post.url
        htmlfile = post.site.config["destination"] + post.url
        pdffile = File.join(File.dirname(htmlfile), File.basename(htmlfile, File.extname(htmlfile))+".pdf")

        Jekyll.logger.debug "Generate pdf:", pdffile

        cmd = "pandoc #{post.path} --output #{pdffile} --template jobposting.tex -M qrcode='#{qrcode}'"

        Dir.chdir(post.site.config["plugins_dir"]){
            %x[#{cmd}] unless File.exists?(pdffile)
        }
    end
end
