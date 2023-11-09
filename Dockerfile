FROM alpine:edge

RUN apk add perl-app-cpanminus slides  --no-cache

RUN cpanm Graph::Easy

COPY presentation.md /presentation.md

RUN chmod +x /presentation.md

EXPOSE 53531
ENV SLIDES_SERVER_HOST=0.0.0.0
CMD slides serve /presentation.md
