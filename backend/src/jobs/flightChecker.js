const cron = require("node-cron");
const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");
const { DateTime } = require("luxon");
const amadeusProvider = require("../services/flightProviders/amadeusProvider");
// Import destinations from the JSON file
const destinations = require("../data/destinations.json");

const SOURCE_CITY_CODE = "BLR";
const REQUIRED_SEATS = 9;

// Helper function to check if a month falls within a range string
const isMonthInRanges = (monthName, rangesStr) => {
  const currentMonth = monthName.toLowerCase();
  const ranges = rangesStr.split(",").map((r) => r.trim());

  const monthMap = {
    january: 1,
    february: 2,
    march: 3,
    april: 4,
    may: 5,
    june: 6,
    july: 7,
    august: 8,
    september: 9,
    october: 10,
    november: 11,
    december: 12,
  };

  const currentMonthNum = monthMap[currentMonth];
  if (!currentMonthNum) return false; // Should not happen

  for (const range of ranges) {
    const months = range.split("–").map((m) => m.trim().toLowerCase());
    if (months.length === 1) {
      // Single month check
      if (months[0] === currentMonth) return true;
    } else if (months.length === 2) {
      // Range check
      const startMonthNum = monthMap[months[0]];
      const endMonthNum = monthMap[months[1]];

      if (startMonthNum && endMonthNum) {
        if (startMonthNum <= endMonthNum) {
          // Normal range (e.g., April-June)
          if (currentMonthNum >= startMonthNum && currentMonthNum <= endMonthNum) {
            return true;
          }
        } else {
          // Wraparound range (e.g., November-February)
          if (currentMonthNum >= startMonthNum || currentMonthNum <= endMonthNum) {
            return true;
          }
        }
      }
    }
  }
  return false;
};

const checkFlightsAndSendEmail = async () => {
  console.log("Starting daily flight check job...");
  const recipientEmail = process.env.RECIPIENT_EMAIL;
  const mailerSendApiKey = process.env.MAILERSEND_API_KEY;

  if (!recipientEmail || !mailerSendApiKey) {
    console.error(
      "Missing RECIPIENT_EMAIL or MAILERSEND_API_KEY in environment variables. Skipping email."
    );
    return;
  }

  const mailerSend = new MailerSend({ apiKey: mailerSendApiKey });

  const tomorrow = DateTime.now().plus({ days: 1 });
  const tomorrowDateStr = tomorrow.toFormat("yyyy-MM-dd");
  const tomorrowMonthName = tomorrow.toFormat("LLLL"); // Full month name, e.g., "September"

  console.log(`Checking flights for ${tomorrowDateStr} (Month: ${tomorrowMonthName})`);

  const relevantDestinations = destinations.filter((dest) =>
    isMonthInRanges(tomorrowMonthName, dest.BestMonths)
  );

  if (relevantDestinations.length === 0) {
    console.log("No destinations match the best travel month criteria for tomorrow. Job finished.");
    return;
  }

  console.log(
    `Found ${relevantDestinations.length} potential destinations for tomorrow:`,
    relevantDestinations.map((d) => d.AirportCode)
  );

  const availableFlightsInfo = [];

  for (const dest of relevantDestinations) {
    try {
      const searchParams = {
        origin: SOURCE_CITY_CODE,
        destination: dest.AirportCode,
        departureDate: tomorrowDateStr,
        airlineCode: "AI", // Assuming Air India focus based on prompt? Or remove if any airline ok
      };
      console.log(
        `Checking flights for ${SOURCE_CITY_CODE} -> ${dest.AirportCode} on ${tomorrowDateStr}`
      );
      const flights = await amadeusProvider.searchOneWayFlights(searchParams);

      // Check if any flight in the results meets the seat requirement
      const hasSufficientSeats = flights.some((flight) => flight.seats >= REQUIRED_SEATS);

      if (hasSufficientSeats) {
        console.log(`Found suitable flights for ${dest.City} (${dest.AirportCode})!`);
        availableFlightsInfo.push({
          city: dest.City,
          country: dest.Country,
          code: dest.AirportCode,
          bestMonths: dest.BestMonths,
          // We don't need flight details, just confirmation
        });
      } else {
        console.log(`No flights with >= ${REQUIRED_SEATS} seats found for ${dest.AirportCode}.`);
      }
    } catch (error) {
      // Log errors from Amadeus but continue checking other destinations
      if (error.response?.status === 400 && error.message.includes("NO_FLIGHT_FOUND")) {
        // This is common, just means no flights scheduled/available
        console.log(
          `Amadeus: No flights found for ${SOURCE_CITY_CODE} -> ${dest.AirportCode} on ${tomorrowDateStr}.`
        );
      } else if (error.message.includes("required for")) {
        console.warn(
          `Skipping ${dest.AirportCode} due to missing data requirement: ${error.message}`
        );
      } else {
        console.error(`Error checking flights for ${dest.AirportCode}:`, error.message);
      }
      // Consider adding more specific error handling if needed
    }
    // Optional: Add a small delay between API calls if needed
    // await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Send email if suitable flights were found
  if (availableFlightsInfo.length > 0) {
    console.log(
      `Found ${availableFlightsInfo.length} destinations with flights having >= ${REQUIRED_SEATS} seats. Preparing email.`
    );

    const emailSubject = `Flight Alert: ${SOURCE_CITY_CODE} Flights Available for ${tomorrowDateStr}`;
    let emailHtmlBody = `<h2>Flight Availability Alert for ${tomorrowDateStr}</h2>`;
    emailHtmlBody += `<p>One-way flights from ${SOURCE_CITY_CODE} with at least ${REQUIRED_SEATS} seats were found for the following destinations (optimal travel month):</p>`;
    emailHtmlBody += "<ul>";
    availableFlightsInfo.forEach((info) => {
      emailHtmlBody += `<li><b>${info.city}, ${info.country} (${info.code})</b> - Best Months: ${info.bestMonths}</li>`;
    });
    emailHtmlBody += "</ul>";
    emailHtmlBody += "<p>Please verify directly as availability can change quickly.</p>";

    const sentFrom = new Sender(
      "flightalerts@test-z0vklo6688vl7qrx.mlsender.net",
      "Flight Alert Service"
    ); // IMPORTANT: Replace with your verified MailerSend sender domain/email
    const recipients = [new Recipient(recipientEmail)];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(emailSubject)
      .setHtml(emailHtmlBody);
    // .setText(textBody); // Optional: Add plain text version

    try {
      await mailerSend.email.send(emailParams);
      console.log(`Email successfully sent to ${recipientEmail}`);
    } catch (error) {
      console.error("Error sending email via MailerSend:", error.response?.body || error.message);
    }
  } else {
    console.log(
      "No destinations with suitable flights found after checking Amadeus. No email sent."
    );
  }

  console.log("Daily flight check job finished.");
};

// Schedule the job
// IST is UTC+5:30. 9:00 PM IST is 15:30 UTC.
// Cron format: minute hour day-of-month month day-of-week
// '30 15 * * *' runs at 15:30 UTC (9:00 PM IST) every day.
const scheduleJob = () => {
  cron.schedule("30 15 * * *", checkFlightsAndSendEmail, {
    scheduled: true,
    timezone: "UTC", // Schedule based on UTC
  });
  console.log("Flight check job scheduled to run daily at 9:00 PM IST (15:30 UTC)");

  // Optional: Run once immediately on startup for testing
  // console.log('Running initial flight check on startup...');
  // checkFlightsAndSendEmail();
};

module.exports = { scheduleJob };
