FROM python:3

# copy app data to image
WORKDIR /app
COPY . .

# install dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# check for data folder exists for database file
RUN mkdir -p /app/data
RUN mkdir -p /app/static

# migrating data
RUN python manage.py migrate --run-syncdb
RUN python manage.py collectstatic --noinput

# create super user
ENV DJANGO_SUPERUSER_USERNAME=admin
ENV DJANGO_SUPERUSER_PASSWORD=admin
ENV DJANGO_SUPERUSER_EMAIL=
RUN python manage.py createsuperuser --noinput

# run django server
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
