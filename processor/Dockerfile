# Set the base image to use python 3.6.5  --- May be changing to linux debian in future
FROM python:3.6.5

# Make a directory and set the working directory to /source
WORKDIR /source

# Copy relevant files that the container will need
ADD handler.py /source
ADD main.py /source
ADD requirements.txt /source

# Install any needed packages specified in requirements.txt
RUN pip install -r requirements.txt

# Run app.py when the container launches
CMD ["python", "main.py"]