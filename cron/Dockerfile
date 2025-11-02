FROM python:3.11-slim

RUN apt-get update && apt-get install -y cron tzdata && apt-get clean

ENV TZ=Asia/Bangkok
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN echo "*/15 * * * * python3 /app/main.py >> /var/log/cron.log 2>&1" > /etc/cron.d/my-cron-job

RUN chmod 0644 /etc/cron.d/my-cron-job && \
    crontab /etc/cron.d/my-cron-job && \
    touch /var/log/cron.log

CMD python3 /app/main.py && cron && tail -f /var/log/cron.log
