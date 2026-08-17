using Lollita.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Lollita.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Admin> Admins => Set<Admin>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var admin = modelBuilder.Entity<Admin>();

        admin.ToTable("admins");

        admin.HasKey(a => a.Id);
        admin.Property(a => a.Id).HasColumnName("id");

        admin.Property(a => a.FullName)
            .HasColumnName("full_name")
            .HasMaxLength(100)
            .IsRequired();

        admin.Property(a => a.Email)
            .HasColumnName("email")
            .HasMaxLength(256)
            .IsRequired();

        admin.HasIndex(a => a.Email).IsUnique();

        admin.Property(a => a.PasswordHash)
            .HasColumnName("password_hash")
            .IsRequired();

        admin.Property(a => a.Role)
            .HasColumnName("role")
            .HasMaxLength(50)
            .IsRequired()
            .HasDefaultValue("Admin");

        admin.Property(a => a.IsActive)
            .HasColumnName("is_active")
            .HasDefaultValue(true);

        admin.Property(a => a.CreatedAt)
            .HasColumnName("created_at")
            .HasDefaultValueSql("NOW()");

        admin.Property(a => a.LastLoginAt)
            .HasColumnName("last_login_at");
    }
}
