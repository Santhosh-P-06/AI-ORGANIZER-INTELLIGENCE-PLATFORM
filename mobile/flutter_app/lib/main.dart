import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

const apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://localhost:3000',
);

void main() {
  runApp(const EventOrganiserMobileApp());
}

class EventOrganiserMobileApp extends StatelessWidget {
  const EventOrganiserMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'AI Event Organiser',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF4F46E5)),
        useMaterial3: true,
      ),
      home: const EventListScreen(),
    );
  }
}

class EventListScreen extends StatefulWidget {
  const EventListScreen({super.key});

  @override
  State<EventListScreen> createState() => _EventListScreenState();
}

class _EventListScreenState extends State<EventListScreen> {
  late Future<List<dynamic>> eventsFuture;

  @override
  void initState() {
    super.initState();
    eventsFuture = fetchEvents();
  }

  Future<List<dynamic>> fetchEvents() async {
    final response = await http.get(Uri.parse('$apiBaseUrl/api/events'));
    if (response.statusCode != 200) {
      throw Exception('Failed to load events');
    }

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    return data['events'] as List<dynamic>;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Student Events')),
      body: FutureBuilder<List<dynamic>>(
        future: eventsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(child: Text('Unable to load events: ${snapshot.error}'));
          }

          final events = snapshot.data ?? [];
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: events.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final event = events[index] as Map<String, dynamic>;
              return Card(
                child: ListTile(
                  title: Text(event['title'] as String? ?? 'Untitled Event'),
                  subtitle: Text('${event['type']} | ${event['venue']}'),
                  trailing: const Icon(Icons.chevron_right),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
